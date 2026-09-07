import json

import streamlit as st

from backend.space_agi import SpaceAGIOrchestrator


st.set_page_config(page_title="SPACE AGI OS", page_icon="🛰️", layout="wide")

if "space_agi" not in st.session_state:
    st.session_state.space_agi = SpaceAGIOrchestrator()

orchestrator = st.session_state.space_agi

st.title("SPACE AGI OS")
st.caption("Goal-driven orchestration layer for EO data, missions, ground stations, research, communications and commercial workflows.")

left, right = st.columns([2, 1])

with left:
    goal = st.text_area(
        "Mission Goal",
        height=150,
        placeholder="例如：处理伯利兹 0.3m 卫星影像编程项目，整理需求、查询数据、联系厂家并进入报价流程。",
    )
    context_text = st.text_area(
        "Structured Context (JSON, optional)",
        height=180,
        value='{"area_km2": 2029, "resolution_m": 0.3, "cloud_max_pct": 15, "processing": "L1", "crs": "WGS84"}',
    )

with right:
    st.subheader("Agent Network")
    for name, description in orchestrator.registry.capabilities().items():
        st.markdown(f"**{name.upper()}**  \n{description}")

if st.button("RUN GOAL", type="primary", use_container_width=True):
    if not goal.strip():
        st.error("Please enter a goal.")
    else:
        try:
            context = json.loads(context_text) if context_text.strip() else {}
        except json.JSONDecodeError as exc:
            st.error(f"Context JSON is invalid: {exc}")
        else:
            with st.spinner("Planning and executing..."):
                result = orchestrator.run(goal.strip(), context)
            st.session_state.last_space_agi_result = result

result = st.session_state.get("last_space_agi_result")
if result:
    st.divider()
    c1, c2, c3 = st.columns(3)
    tasks = list(result.get("tasks", {}).values())
    c1.metric("Status", str(result.get("status", "unknown")).upper())
    c2.metric("Tasks", len(tasks))
    c3.metric("Completed", sum(1 for item in tasks if item.get("status") == "completed"))

    st.subheader("Execution Trace")
    for item in tasks:
        with st.expander(f"{item.get('agent', '').upper()} · {item.get('objective', '')}", expanded=True):
            st.write("Status:", item.get("status"))
            st.write("Attempts:", item.get("attempts"))
            st.json(item.get("result") or {})
            if item.get("error"):
                st.error(item["error"])

st.divider()
st.subheader("Memory Search")
query = st.text_input("Recall previous plans, tasks or results")
if query:
    memories = orchestrator.memory.recall(query)
    st.write(f"{len(memories)} memory record(s)")
    for item in reversed(memories):
        with st.expander(f"{item.get('kind')} · {item.get('ts')}"):
            st.json(item)
