from __future__ import annotations

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

from pipeline.warehouse import (
    init_warehouse,
    query_aggregated_metrics,
    query_risk_trend,
    query_severity_distribution,
    query_strategy_breakdown,
    query_violation_type_distribution,
)
from pipeline.vector_store import get_collection_stats, semantic_search
from pipeline.triage_agent import triage_violation

st.set_page_config(page_title="AkrivonAI Analytics", layout="wide")

init_warehouse()


def render_header():
    st.title("AkrivonAI Security Analytics")
    st.markdown("Real-time analytics dashboard for AI boundary testing and vulnerability intelligence.")


def render_kpi_cards():
    metrics = query_aggregated_metrics()
    vector_stats = get_collection_stats()

    cols = st.columns(5)
    cols[0].metric("Total Scans", metrics["total_scans"])
    cols[1].metric("Total Violations", metrics["total_violations"])
    cols[2].metric("Avg Risk Score", f"{metrics['avg_risk_score']:.1f}")
    cols[3].metric("Avg Confidence", f"{metrics['avg_confidence']:.1%}")
    cols[4].metric("Indexed Embeddings", vector_stats["total_embeddings"])


def render_risk_trend():
    st.subheader("Risk Score Trend")
    data = query_risk_trend(limit=50)
    if not data:
        st.info("No scan data available yet. Run some scans to populate the warehouse.")
        return

    df = pd.DataFrame(data)
    df["created_at"] = pd.to_datetime(df["created_at"])

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df["created_at"], y=df["risk_score"],
        mode="lines+markers", name="Risk Score",
        line=dict(color="#ef4444", width=2),
        marker=dict(size=6),
    ))
    fig.add_trace(go.Bar(
        x=df["created_at"], y=df["total_violations"],
        name="Violations", yaxis="y2",
        marker_color="rgba(99, 102, 241, 0.4)",
    ))
    fig.update_layout(
        yaxis=dict(title="Risk Score", range=[0, 100]),
        yaxis2=dict(title="Violations", overlaying="y", side="right"),
        height=400,
        legend=dict(orientation="h", yanchor="bottom", y=1.02),
    )
    st.plotly_chart(fig, use_container_width=True)


def render_strategy_breakdown():
    st.subheader("Strategy Effectiveness")
    data = query_strategy_breakdown()
    if not data:
        st.info("No violation data available.")
        return

    df = pd.DataFrame(data)

    col1, col2 = st.columns(2)

    with col1:
        fig = px.bar(
            df, x="strategy", y="count", color="severe_count",
            color_continuous_scale="RdYlGn_r",
            labels={"count": "Total Violations", "severe_count": "Severe"},
            title="Violations by Attack Strategy",
        )
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        fig = px.scatter(
            df, x="avg_confidence", y="count", size="severe_count",
            text="strategy", title="Strategy: Confidence vs Volume",
            labels={"avg_confidence": "Avg Confidence", "count": "Violations"},
        )
        fig.update_traces(textposition="top center")
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)


def render_severity_distribution():
    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Severity Distribution")
        data = query_severity_distribution()
        if data:
            colors = {"low": "#22c55e", "medium": "#eab308", "high": "#f97316", "critical": "#ef4444"}
            fig = px.pie(
                names=list(data.keys()),
                values=list(data.values()),
                color=list(data.keys()),
                color_discrete_map=colors,
                title="Violations by Severity",
            )
            fig.update_layout(height=350)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No data.")

    with col2:
        st.subheader("Violation Type Distribution")
        data = query_violation_type_distribution()
        if data:
            fig = px.pie(
                names=list(data.keys()),
                values=list(data.values()),
                title="Violations by Type",
            )
            fig.update_layout(height=350)
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("No data.")


def render_semantic_search():
    st.subheader("Semantic Violation Search")
    st.markdown("Search across all indexed violations using natural language.")

    col1, col2, col3 = st.columns([3, 1, 1])
    with col1:
        query = st.text_input("Search query", placeholder="e.g., prompt injection bypassing role restrictions")
    with col2:
        severity = st.selectbox("Severity filter", ["All", "critical", "high", "medium", "low"])
    with col3:
        n_results = st.slider("Results", 1, 20, 10)

    if query:
        sev_filter = severity if severity != "All" else None
        results = semantic_search(query, n_results=n_results, severity_filter=sev_filter)

        if results:
            for r in results:
                severity_colors = {"critical": "red", "high": "orange", "medium": "yellow", "low": "green"}
                color = severity_colors.get(r.severity, "gray")
                with st.expander(
                    f":{color}[{r.severity.upper()}] | {r.strategy} | Score: {r.similarity_score:.3f}"
                ):
                    st.markdown(f"**Scan:** `{r.scan_id}`")
                    st.markdown(f"**Probe:** {r.probe}")
                    st.markdown(f"**Reason:** {r.reason}")
                    st.markdown(f"**Similarity:** {r.similarity_score:.4f}")
        else:
            st.info("No matching violations found.")


def render_triage_panel():
    st.subheader("AI Triage Agent")
    st.markdown("Submit a violation for automated triage using the agentic workflow.")

    with st.form("triage_form"):
        col1, col2 = st.columns(2)
        with col1:
            strategy = st.selectbox("Strategy", [
                "RoleTransformation", "GradualDrift", "LanguageVariation",
                "MultiTurnEscalation", "EncodingBypass", "IndirectInjection",
                "PersonaInjection", "PayloadSplitting",
            ])
            severity = st.selectbox("Severity", ["critical", "high", "medium", "low"])
        with col2:
            violation_type = st.selectbox("Violation type", [
                "capability_drift", "role_drift", "domain_violation",
            ])
            confidence = st.slider("Confidence", 0.0, 1.0, 0.8)

        probe = st.text_area("Probe text", placeholder="The adversarial prompt that was used...")
        reason = st.text_area("Violation reason", placeholder="Why this is a violation...")
        submitted = st.form_submit_button("Run Triage Agent")

    if submitted and probe:
        with st.spinner("Triage agent is analyzing..."):
            violation = {
                "strategy": strategy,
                "prompt": probe,
                "response": "",
                "analysis": {
                    "type": violation_type,
                    "severity": severity,
                    "confidence": confidence,
                    "reason": reason,
                },
                "_id": "manual-triage",
            }
            result = triage_violation(violation)

            priority_colors = {"P0": "red", "P1": "orange", "P2": "blue", "P3": "green"}
            color = priority_colors.get(result.priority, "gray")

            st.markdown(f"### :{color}[Priority: {result.priority}]")
            st.markdown(f"**Cluster:** {result.cluster_label}")
            st.markdown(f"**Risk Assessment:** {result.risk_assessment}")
            st.markdown(f"**Remediation:** {result.remediation}")

            if result.similar_findings:
                st.markdown(f"**Similar findings:** {', '.join(result.similar_findings)}")


def main():
    render_header()
    st.divider()
    render_kpi_cards()
    st.divider()
    render_risk_trend()
    st.divider()
    render_strategy_breakdown()
    st.divider()
    render_severity_distribution()
    st.divider()

    tab1, tab2 = st.tabs(["Semantic Search", "AI Triage"])
    with tab1:
        render_semantic_search()
    with tab2:
        render_triage_panel()


if __name__ == "__main__":
    main()
