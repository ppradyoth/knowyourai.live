from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import functions as F
from pyspark.sql.types import (
    ArrayType,
    DoubleType,
    IntegerType,
    StringType,
    StructField,
    StructType,
    TimestampType,
)

VIOLATION_SCHEMA = StructType([
    StructField("scan_id", StringType(), False),
    StructField("strategy", StringType(), True),
    StructField("probe", StringType(), True),
    StructField("response", StringType(), True),
    StructField("violation_type", StringType(), True),
    StructField("severity", StringType(), True),
    StructField("confidence", DoubleType(), True),
    StructField("reason", StringType(), True),
    StructField("target_url", StringType(), True),
    StructField("use_case", StringType(), True),
    StructField("created_at", TimestampType(), True),
])

SCAN_SCHEMA = StructType([
    StructField("scan_id", StringType(), False),
    StructField("target_url", StringType(), True),
    StructField("use_case", StringType(), True),
    StructField("total_tests", IntegerType(), True),
    StructField("risk_score", DoubleType(), True),
    StructField("status", StringType(), True),
    StructField("created_at", TimestampType(), True),
])

SEVERITY_WEIGHTS = {"low": 0.25, "medium": 0.5, "high": 0.8, "critical": 1.0}


def get_spark() -> SparkSession:
    return (
        SparkSession.builder
        .appName("AkrivonAI-SecurityPipeline")
        .master("local[*]")
        .config("spark.sql.shuffle.partitions", "4")
        .config("spark.driver.memory", "2g")
        .getOrCreate()
    )


def flatten_scan_records(scan_records: list[dict[str, Any]]) -> tuple[list[dict], list[dict]]:
    scans = []
    violations = []
    for record in scan_records:
        config = record.get("config", {})
        summary = record.get("summary", {})
        scan_id = record.get("scan_id", "")
        created = record.get("created_at", datetime.now(timezone.utc).isoformat())

        scans.append({
            "scan_id": scan_id,
            "target_url": str(config.get("api_url", "")),
            "use_case": config.get("use_case", ""),
            "total_tests": summary.get("total_tests", 0),
            "risk_score": summary.get("risk_score", 0.0),
            "status": record.get("status", "complete"),
            "created_at": created,
        })

        for i, v in enumerate(record.get("violations", [])):
            analysis = v.get("analysis", {})
            violations.append({
                "scan_id": scan_id,
                "strategy": v.get("strategy", ""),
                "probe": v.get("prompt", ""),
                "response": v.get("response", "")[:2000],
                "violation_type": analysis.get("type", "none"),
                "severity": analysis.get("severity", "low"),
                "confidence": analysis.get("confidence", 0.0),
                "reason": analysis.get("reason", ""),
                "target_url": str(config.get("api_url", "")),
                "use_case": config.get("use_case", ""),
                "created_at": created,
            })

    return scans, violations


def compute_strategy_effectiveness(violations_df: DataFrame) -> DataFrame:
    return (
        violations_df
        .groupBy("strategy")
        .agg(
            F.count("*").alias("total_violations"),
            F.avg("confidence").alias("avg_confidence"),
            F.sum(F.when(F.col("severity").isin("high", "critical"), 1).otherwise(0)).alias("severe_count"),
            F.sum(F.when(F.col("severity") == "critical", 1).otherwise(0)).alias("critical_count"),
            F.countDistinct("scan_id").alias("scans_affected"),
        )
        .withColumn("severity_ratio", F.col("severe_count") / F.col("total_violations"))
        .orderBy(F.col("total_violations").desc())
    )


def compute_risk_trend(scans_df: DataFrame, violations_df: DataFrame) -> DataFrame:
    scan_violations = (
        violations_df
        .groupBy("scan_id")
        .agg(
            F.count("*").alias("violation_count"),
            F.avg("confidence").alias("avg_confidence"),
            F.sum(
                F.when(F.col("severity") == "critical", F.lit(SEVERITY_WEIGHTS["critical"]))
                .when(F.col("severity") == "high", F.lit(SEVERITY_WEIGHTS["high"]))
                .when(F.col("severity") == "medium", F.lit(SEVERITY_WEIGHTS["medium"]))
                .otherwise(F.lit(SEVERITY_WEIGHTS["low"]))
                * F.col("confidence")
            ).alias("weighted_risk"),
        )
    )

    return (
        scans_df
        .join(scan_violations, "scan_id", "left")
        .withColumn("violation_count", F.coalesce(F.col("violation_count"), F.lit(0)))
        .withColumn("violation_rate", F.col("violation_count") / F.greatest(F.col("total_tests"), F.lit(1)))
        .select(
            "scan_id", "created_at", "risk_score", "total_tests",
            "violation_count", "violation_rate", "avg_confidence", "weighted_risk",
        )
        .orderBy("created_at")
    )


def compute_severity_over_time(violations_df: DataFrame) -> DataFrame:
    return (
        violations_df
        .withColumn("date", F.to_date("created_at"))
        .groupBy("date")
        .pivot("severity", ["low", "medium", "high", "critical"])
        .agg(F.count("*"))
        .na.fill(0)
        .orderBy("date")
    )


def compute_violation_type_by_strategy(violations_df: DataFrame) -> DataFrame:
    return (
        violations_df
        .groupBy("strategy", "violation_type")
        .agg(
            F.count("*").alias("count"),
            F.avg("confidence").alias("avg_confidence"),
        )
        .orderBy("strategy", F.col("count").desc())
    )


def compute_target_risk_profile(violations_df: DataFrame) -> DataFrame:
    return (
        violations_df
        .groupBy("target_url", "use_case")
        .agg(
            F.count("*").alias("total_violations"),
            F.countDistinct("scan_id").alias("scan_count"),
            F.avg("confidence").alias("avg_confidence"),
            F.sum(F.when(F.col("severity").isin("high", "critical"), 1).otherwise(0)).alias("severe_count"),
            F.collect_set("strategy").alias("strategies_triggered"),
        )
        .withColumn("risk_density", F.col("severe_count") / F.greatest(F.col("total_violations"), F.lit(1)))
        .orderBy(F.col("total_violations").desc())
    )


def run_batch_etl(scan_records: list[dict[str, Any]]) -> dict[str, list[dict]]:
    spark = get_spark()

    scans_raw, violations_raw = flatten_scan_records(scan_records)
    if not scans_raw:
        return {"strategy_effectiveness": [], "risk_trend": [], "severity_over_time": [],
                "type_by_strategy": [], "target_risk_profile": []}

    scans_df = spark.createDataFrame(scans_raw, schema=SCAN_SCHEMA)
    violations_df = spark.createDataFrame(violations_raw, schema=VIOLATION_SCHEMA) if violations_raw else spark.createDataFrame([], schema=VIOLATION_SCHEMA)

    results = {}

    strategy_df = compute_strategy_effectiveness(violations_df)
    results["strategy_effectiveness"] = [row.asDict() for row in strategy_df.collect()]

    risk_df = compute_risk_trend(scans_df, violations_df)
    results["risk_trend"] = [row.asDict() for row in risk_df.collect()]

    severity_df = compute_severity_over_time(violations_df)
    results["severity_over_time"] = [row.asDict() for row in severity_df.collect()]

    type_strategy_df = compute_violation_type_by_strategy(violations_df)
    results["type_by_strategy"] = [row.asDict() for row in type_strategy_df.collect()]

    target_df = compute_target_risk_profile(violations_df)
    results["target_risk_profile"] = [row.asDict() for row in target_df.collect()]

    return results
