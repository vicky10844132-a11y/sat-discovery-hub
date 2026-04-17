import streamlit as st
from streamlit_folium import st_folium
import folium

st.set_page_config(page_title="SAT-INDEX ONLINE", layout="wide")
st.markdown("<style>section[data-testid='stSidebar'] {display: none;}</style>", unsafe_allow_html=True)
st.title("SAT-INDEX ONLINE")
col1, col2, col3 = st.columns(3)
col1.metric("Online Status", "Online")
col2.metric("Engine Status", "Active")
col3.metric("Privacy Status", "Enabled")

st.header("Data Ingestion")
tabs = st.tabs(["Storage Mount", "STAC Scan", "Local Upload"])
with tabs[0]: st.write("Mount storage here.")
with tabs[1]: st.write("Scan STAC here.")
with tabs[2]: st.file_uploader("Upload files")

st.header("Compute")
st.radio("Compute Type", ["Local GPU", "Cloud Clusters"])

st.header("Algorithm Suite")
c1, c2, c3 = st.columns(3)
c1.button("Cloud Masking (s2cloudless)")
c2.button("Super-resolution (HAT-SR)")
c3.button("Atmospheric Correction")

st.header("QC Module")
st.button("MD5 Check")
st.button("Bit-depth Check")
st.button("GeoKey Check")

st.header("Map & Delivery")
m = folium.Map(location=[0, 0], zoom_start=2)
st_folium(m, width=1000)

st.subheader("Export")
st.text_input("Bounds")
st.selectbox("Format", ["GeoJSON", "TIFF"])
st.button("Export")