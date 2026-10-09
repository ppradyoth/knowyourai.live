from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import duckdb

_DB_PATH = os.getenv("WAREHOUSE_DB_PATH", str(Path(__file__).parent / "akrivon_warehouse.duckdb"))

_SCHEMA_DDL = """
CREATE TABLE IF NOT EXISTS dim_strategy (
    strategy_key   INTEGER PRIMARY KEY,
    strategy_name  VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS dim_severity (
    severity_key   INTEGER PRIMARY KEY,
    severity_level VARCHAR NOT NULL UNIQUE,
    weight         DOUBLE  NOT NULL
);

CREATE TABLE IF NOT EXISTS dim_violation_type (
    type_key  INTEGER PRIMARY KEY,
    type_name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS dim_scan (
    scan_key     INTEGER PRIMARY KEY,
    scan_id      VARCHAR NOT NULL UNIQUE,
    target_url   VARCHAR,
    use_case     VARCHAR,
    total_tests  INTEGER,
    risk_score   DOUBLE,
    status       VARCHAR,
    created_at   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fact_violations (
    violation_key    INTEGER PRIMARY KEY,
    scan_key         INTEGER REFERENCES dim_scan(scan_key),
    strategy_key     INTEGER REFERENCES dim_strategy(strategy_key),
    severity_key     INTEGER REFERENCES dim_severity(severity_key),
    type_key         INTEGER REFERENCES dim_violation_type(type_key),
    probe            VARCHAR,
    response         VARCHAR,
    reason           VARCHAR,
    confidence       DOUBLE,
    triage_status    VARCHAR DEFAULT 'pending',
    triage_priority  VARCHAR,
    cluster_label    VARCHAR,
    remediation      VARCHAR,
    created_at       TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fact_scan_metrics (
    metric_key          INTEGER PRIMARY KEY,
    scan_key            INTEGER REFERENCES dim_scan(scan_key),
    total_violations    INTEGER,
    critical_count      INTEGER,
    high_count          INTEGER,
    medium_count        INTEGER,
    low_count           INTEGER,
    risk_score          DOUBLE,
    violation_rate      DOUBLE,
    created_at          TIMESTAMP
);

CREATE SEQUENCE IF NOT EXISTS seq_violation START 1;
CREATE SEQUENCE IF NOT EXISTS seq_scan START 1;
CREATE SEQUENCE IF NOT EXISTS seq_metric START 1;
"""

_SEED_DIMENSIONS = """
INSERT OR IGNORE INTO dim_severity VALUES (1, 'low', 0.25);
INSERT OR IGNORE INTO dim_severity VALUES (2, 'medium', 0.5);
INSERT OR IGNORE INTO dim_severity VALUES (3, 'high', 0.8);
INSERT OR IGNORE INTO dim_severity VALUES (4, 'critical', 1.0);

INSERT OR IGNORE INTO dim_violation_type VALUES (1, 'capability_drift');
INSERT OR IGNORE INTO dim_violation_type VALUES (2, 'role_drift');
INSERT OR IGNORE INTO dim_violation_type VALUES (3, 'domain_violation');
INSERT OR IGNORE INTO dim_violation_type VALUES (4, 'none');

INSERT OR IGNORE INTO dim_strategy VALUES (1, 'RoleTransformation');
INSERT OR IGNORE INTO dim_strategy VALUES (2, 'GradualDrift');
INSERT OR IGNORE INTO dim_strategy VALUES (3, 'LanguageVariation');
INSERT OR IGNORE INTO dim_strategy VALUES (4, 'MultiTurnEscalation');
INSERT OR IGNORE INTO dim_strategy VALUES (5, 'EncodingBypass');
INSERT OR IGNORE INTO dim_strategy VALUES (6, 'IndirectInjection');
INSERT OR IGNORE INTO dim_strategy VALUES (7, 'PersonaInjection');
INSERT OR IGNORE INTO dim_strategy VALUES (8, 'PayloadSplitting');
"""


def get_connection() -> duckdb.DuckDBPyConnection:
    return duckdb.connect(_DB_PATH)


def init_warehouse() -> None:
    con = get_connection()
    for stmt in _SCHEMA_DDL.strip().split(";"):
        stmt = stmt.strip()
        if stmt:
            con.execute(stmt)
    for stmt in _SEED_DIMENSIONS.strip().split(";"):
        stmt = stmt.strip()
        if stmt:
            con.execute(stmt)
    con.close()


def _get_or_create_strategy_key(con: duckdb.DuckDBPyConnection, name: str) -> int:
    row = con.execute("SELECT strategy_key FROM dim_strategy WHERE strategy_name = ?", [name]).fetchone()
    if row:
        return row[0]
    max_key = con.execute("SELECT COALESCE(MAX(strategy_key), 0) FROM dim_strategy").fetchone()[0]
    new_key = max_key + 1
    con.execute("INSERT INTO dim_strategy VALUES (?, ?)", [new_key, name])
    return new_key


def load_scan(con: duckdb.DuckDBPyConnection, scan_record: dict[str, Any]) -> int:
    existing = con.execute(
        "SELECT scan_key FROM dim_scan WHERE scan_id = ?",
        [scan_record["scan_id"]],
    ).fetchone()
    if existing:
        return existing[0]

    scan_key = con.execute("SELECT nextval('seq_scan')").fetchone()[0]
    config = scan_record.get("config", {})
    summary = scan_record.get("summary", {})
    created = scan_record.get("created_at", datetime.now(timezone.utc).isoformat())

    con.execute(
        """INSERT INTO dim_scan (scan_key, scan_id, target_url, use_case, total_tests, risk_score, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        [
            scan_key,
            scan_record["scan_id"],
            str(config.get("api_url", "")),
            config.get("use_case", ""),
            summary.get("total_tests", 0),
            summary.get("risk_score", 0.0),
            scan_record.get("status", "complete"),
            created[:19] if isinstance(created, str) else created,
        ],
    )
    return scan_key


def load_violations(con: duckdb.DuckDBPyConnection, scan_key: int, violations: list[dict]) -> list[int]:
    keys = []
    for v in violations:
        analysis = v.get("analysis", {})
        violation_key = con.execute("SELECT nextval('seq_violation')").fetchone()[0]

        strategy_key = _get_or_create_strategy_key(con, v.get("strategy", "Unknown"))
        severity_level = analysis.get("severity", "low")
        severity_row = con.execute(
            "SELECT severity_key FROM dim_severity WHERE severity_level = ?", [severity_level]
        ).fetchone()
        severity_key = severity_row[0] if severity_row else 1

        violation_type = analysis.get("type", "none")
        type_row = con.execute(
            "SELECT type_key FROM dim_violation_type WHERE type_name = ?", [violation_type]
        ).fetchone()
        type_key = type_row[0] if type_row else 4

        con.execute(
            """INSERT INTO fact_violations
               (violation_key, scan_key, strategy_key, severity_key, type_key,
                probe, response, reason, confidence, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
            [
                violation_key, scan_key, strategy_key, severity_key, type_key,
                v.get("prompt", ""),
                v.get("response", "")[:2000],
                analysis.get("reason", ""),
                analysis.get("confidence", 0.0),
            ],
        )
        keys.append(violation_key)
    return keys


def load_scan_metrics(con: duckdb.DuckDBPyConnection, scan_key: int, summary: dict) -> None:
    metric_key = con.execute("SELECT nextval('seq_metric')").fetchone()[0]
    total = summary.get("violations", 0)

    counts = con.execute(
        """SELECT
             SUM(CASE WHEN ds.severity_level = 'critical' THEN 1 ELSE 0 END),
             SUM(CASE WHEN ds.severity_level = 'high' THEN 1 ELSE 0 END),
             SUM(CASE WHEN ds.severity_level = 'medium' THEN 1 ELSE 0 END),
             SUM(CASE WHEN ds.severity_level = 'low' THEN 1 ELSE 0 END)
           FROM fact_violations fv
           JOIN dim_severity ds ON fv.severity_key = ds.severity_key
           WHERE fv.scan_key = ?""",
        [scan_key],
    ).fetchone()

    total_tests = summary.get("total_tests", 1)
    con.execute(
        """INSERT INTO fact_scan_metrics
           (metric_key, scan_key, total_violations, critical_count, high_count,
            medium_count, low_count, risk_score, violation_rate, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)""",
        [
            metric_key, scan_key, total,
            counts[0] or 0, counts[1] or 0, counts[2] or 0, counts[3] or 0,
            summary.get("risk_score", 0.0),
            round(total / max(total_tests, 1), 4),
        ],
    )


def etl_scan_to_warehouse(scan_record: dict[str, Any]) -> int:
    con = get_connection()
    try:
        scan_key = load_scan(con, scan_record)
        violations = scan_record.get("violations", [])
        if violations:
            load_violations(con, scan_key, violations)
        summary = scan_record.get("summary", {})
        if summary:
            load_scan_metrics(con, scan_key, summary)
        return scan_key
    finally:
        con.close()


def query_risk_trend(limit: int = 30) -> list[dict]:
    con = get_connection()
    rows = con.execute(
        """SELECT ds.scan_id, ds.created_at, fm.risk_score, fm.total_violations,
                  fm.critical_count, fm.high_count, fm.violation_rate
           FROM fact_scan_metrics fm
           JOIN dim_scan ds ON fm.scan_key = ds.scan_key
           ORDER BY ds.created_at DESC
           LIMIT ?""",
        [limit],
    ).fetchall()
    con.close()
    return [
        {
            "scan_id": r[0], "created_at": str(r[1]), "risk_score": r[2],
            "total_violations": r[3], "critical_count": r[4],
            "high_count": r[5], "violation_rate": r[6],
        }
        for r in rows
    ]


def query_strategy_breakdown() -> list[dict]:
    con = get_connection()
    rows = con.execute(
        """SELECT dst.strategy_name, COUNT(*) as count,
                  AVG(fv.confidence) as avg_confidence,
                  SUM(CASE WHEN ds.severity_level IN ('high', 'critical') THEN 1 ELSE 0 END) as severe_count
           FROM fact_violations fv
           JOIN dim_strategy dst ON fv.strategy_key = dst.strategy_key
           JOIN dim_severity ds ON fv.severity_key = ds.severity_key
           GROUP BY dst.strategy_name
           ORDER BY count DESC"""
    ).fetchall()
    con.close()
    return [
        {"strategy": r[0], "count": r[1], "avg_confidence": round(r[2], 3), "severe_count": r[3]}
        for r in rows
    ]


def query_severity_distribution() -> dict[str, int]:
    con = get_connection()
    rows = con.execute(
        """SELECT ds.severity_level, COUNT(*)
           FROM fact_violations fv
           JOIN dim_severity ds ON fv.severity_key = ds.severity_key
           GROUP BY ds.severity_level"""
    ).fetchall()
    con.close()
    return {r[0]: r[1] for r in rows}


def query_violation_type_distribution() -> dict[str, int]:
    con = get_connection()
    rows = con.execute(
        """SELECT dt.type_name, COUNT(*)
           FROM fact_violations fv
           JOIN dim_violation_type dt ON fv.type_key = dt.type_key
           GROUP BY dt.type_name"""
    ).fetchall()
    con.close()
    return {r[0]: r[1] for r in rows}


def query_aggregated_metrics() -> dict:
    con = get_connection()
    summary = con.execute(
        """SELECT COUNT(DISTINCT scan_key), COUNT(*),
                  AVG(confidence)
           FROM fact_violations"""
    ).fetchone()

    avg_risk = con.execute(
        "SELECT AVG(risk_score) FROM fact_scan_metrics"
    ).fetchone()

    con.close()
    return {
        "total_scans": summary[0] or 0,
        "total_violations": summary[1] or 0,
        "avg_confidence": round(summary[2] or 0, 3),
        "avg_risk_score": round((avg_risk[0] or 0), 2),
    }
