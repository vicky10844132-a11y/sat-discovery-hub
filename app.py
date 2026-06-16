import streamlit as st
import pandas as pd
from datetime import datetime
from pathlib import Path
import secrets
import string

st.set_page_config(
    page_title="Global Geospatial Resource & Production Hub",
    page_icon="🌐",
    layout="wide"
)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
OWNER_EMAIL = "vicky@glorystellar.com"


def load_csv(name: str, columns: list[str]) -> pd.DataFrame:
    path = DATA_DIR / name
    if path.exists():
        return pd.read_csv(path)
    df = pd.DataFrame(columns=columns)
    df.to_csv(path, index=False)
    return df


def save_csv(name: str, df: pd.DataFrame) -> None:
    (DATA_DIR / name).parent.mkdir(exist_ok=True)
    df.to_csv(DATA_DIR / name, index=False)


def make_token(length: int = 18) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


st.sidebar.title("Production Hub")
page = st.sidebar.radio(
    "Navigation",
    [
        "Home",
        "Resource Provider Registry",
        "AOI / Country Pack Request",
        "Production Factory",
        "QC & Validation",
        "Owner-Only Tile Key Release",
        "Delivery Center",
    ],
)
st.sidebar.markdown("---")
st.sidebar.caption("Global Geospatial Resource & Production Hub")
st.sidebar.caption("Owner-controlled online factory for DSM/DOM production.")


if page == "Home":
    st.title("Global Geospatial Resource & Production Hub")
    st.subheader("全球地理空间资源与产品生产调度中心")
    st.markdown(
        """
        **From global geospatial resources to factory-released DSM/DOM products.**

        This Hub is designed as a resource coordination and production orchestration platform.
        Storage, compute, data, algorithms, reference datasets, production partners and QC partners
        may be provided by different resource owners.

        The platform coordinates resources; it does not automatically own, expose, or consume any provider's resources.

        ### Core Factory Logic
        1. Register resource providers.
        2. Receive AOI / Country Pack requests.
        3. Match data, storage, compute, algorithms and QC resources.
        4. Trigger production workflow.
        5. Validate with reference data.
        6. Release factory package under owner control.
        7. Issue tile-level keys only to the owner-designated email.
        """
    )
    c1, c2, c3 = st.columns(3)
    c1.metric("Factory Model", "Virtual / Light Asset")
    c2.metric("Owner Key Email", OWNER_EMAIL)
    c3.metric("Release Control", "Owner Only")


elif page == "Resource Provider Registry":
    st.title("Resource Provider Registry")
    st.caption("Register storage, compute, data, reference data, algorithms, production and QC resources. These resources may belong to different providers.")
    cols = ["resource_id", "resource_type", "provider_name", "resource_name", "coverage_or_location", "access_method", "cost_model", "permission_level", "security_level", "status", "notes", "created_at"]
    df = load_csv("resource_provider_registry.csv", cols)
    with st.form("resource_form"):
        left, right = st.columns(2)
        with left:
            resource_type = st.selectbox("Resource Type", ["Storage", "Compute", "Data", "Reference Data", "Algorithm / Software", "Production Partner", "QC Partner"])
            provider_name = st.text_input("Provider Name")
            resource_name = st.text_input("Resource Name")
            coverage_or_location = st.text_input("Coverage / Location")
            access_method = st.selectbox("Access Method", ["API", "SFTP", "SSH", "Web Link", "Private Server", "Partner Execution", "Manual"])
        with right:
            cost_model = st.text_input("Cost Model", placeholder="per TB / per hour / per km² / per project")
            permission_level = st.selectbox("Permission Level", ["Read Only", "Write", "Download", "Temporary Access", "Partner Execution Only"])
            security_level = st.selectbox("Security Level", ["Public", "Internal", "Confidential", "Restricted"])
            status = st.selectbox("Status", ["Available", "Testing", "Pending Authorization", "Not Available"])
            notes = st.text_area("Notes")
        if st.form_submit_button("Register Resource"):
            new = {"resource_id": f"RES-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}", "resource_type": resource_type, "provider_name": provider_name, "resource_name": resource_name, "coverage_or_location": coverage_or_location, "access_method": access_method, "cost_model": cost_model, "permission_level": permission_level, "security_level": security_level, "status": status, "notes": notes, "created_at": datetime.utcnow().isoformat()}
            df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
            save_csv("resource_provider_registry.csv", df)
            st.success("Resource registered.")
    st.dataframe(df, use_container_width=True)


elif page == "AOI / Country Pack Request":
    st.title("AOI / Country Pack Request")
    st.caption("Submit AOI or country pack demand. This is the production trigger entry.")
    cols = ["request_id", "client_or_partner", "country_or_aoi", "product_type", "resolution", "accuracy_requirement", "delivery_format", "validation_requirement", "intended_use", "deadline", "contact_email", "status", "created_at"]
    df = load_csv("production_requests.csv", cols)
    with st.form("request_form"):
        left, right = st.columns(2)
        with left:
            client_or_partner = st.text_input("Client / Partner Name")
            country_or_aoi = st.text_area("Country / AOI")
            product_type = st.selectbox("Product Type", ["DSM", "DOM", "DSM + DOM", "DSM + DOM + Tile Service"])
            resolution = st.text_input("Resolution", value="DSM 2m / DOM 0.65m")
            accuracy_requirement = st.text_input("Accuracy Requirement", placeholder="No-control / public reference / GCP / client-provided")
        with right:
            delivery_format = st.multiselect("Delivery Format", ["GeoTIFF", "COG", "Tile", "WMTS/TMS", "Hard Drive", "FTP"], default=["GeoTIFF", "COG"])
            validation_requirement = st.text_area("Validation Requirement")
            intended_use = st.text_area("Intended Use")
            deadline = st.date_input("Deadline")
            contact_email = st.text_input("Contact Email")
        if st.form_submit_button("Submit Request"):
            new = {"request_id": f"REQ-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}", "client_or_partner": client_or_partner, "country_or_aoi": country_or_aoi, "product_type": product_type, "resolution": resolution, "accuracy_requirement": accuracy_requirement, "delivery_format": ", ".join(delivery_format), "validation_requirement": validation_requirement, "intended_use": intended_use, "deadline": str(deadline), "contact_email": contact_email, "status": "Submitted", "created_at": datetime.utcnow().isoformat()}
            df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
            save_csv("production_requests.csv", df)
            st.success("Request submitted.")
    st.dataframe(df, use_container_width=True)


elif page == "Production Factory":
    st.title("StellarDEM Production Factory")
    st.caption("Production workflow from raw data to factory release.")
    workflow = pd.DataFrame([
        {"stage": "01 Data Readiness Check", "control_point": "Coverage, stereo availability, cloud/snow/water risk", "owner": "Platform / Data Provider"},
        {"stage": "02 Resource Matching", "control_point": "Storage, compute, algorithm, production partner", "owner": "Platform"},
        {"stage": "03 Task Split", "control_point": "AOI / grid / tile-level task definition", "owner": "Platform"},
        {"stage": "04 Basic Production", "control_point": "DSM, DOM, orthorectification, mosaic, color balance", "owner": "Production Partner"},
        {"stage": "05 QC Intake", "control_point": "Coverage, format, coordinate, visual check", "owner": "QC Partner / Platform"},
        {"stage": "06 Reference Validation", "control_point": "DEM, LiDAR, GCP, vector, public reference", "owner": "QC Partner"},
        {"stage": "07 Factory Release Review", "control_point": "QC report, accuracy statement, license, delivery note", "owner": "Platform Owner"},
        {"stage": "08 Tile Key Generation", "control_point": "Tile-level access key generated only to owner email", "owner": "Platform Owner"},
        {"stage": "09 Delivery", "control_point": "Owner manually forwards authorized tile keys to client", "owner": "Platform Owner"},
    ])
    st.dataframe(workflow, use_container_width=True)
    st.markdown("""
    ### Owner Control Rule
    Production can be performed by external partners. Storage can be provided by third parties.
    Compute can be rented. Algorithms can be mature public or commercial tools.

    **But the final release, tile-level key control, commercial authorization and client delivery remain owner-controlled.**
    """)


elif page == "QC & Validation":
    st.title("QC & Validation Center")
    st.caption("Reference data registration, accuracy validation and factory release review.")
    cols = ["qc_id", "project_id", "reference_type", "reference_provider", "accuracy_level", "coverage", "license", "can_be_disclosed", "qc_method", "status", "notes", "created_at"]
    df = load_csv("qc_reference_registry.csv", cols)
    with st.form("qc_form"):
        left, right = st.columns(2)
        with left:
            project_id = st.text_input("Project ID")
            reference_type = st.selectbox("Reference Type", ["GCP", "LiDAR", "DEM", "Vector", "Building", "Road", "Water", "Public Reference"])
            reference_provider = st.text_input("Reference Provider")
            accuracy_level = st.selectbox("Accuracy Level", ["High", "Medium", "Public Reference", "Internal Check"])
            coverage = st.text_input("Coverage")
        with right:
            license_type = st.selectbox("License", ["Public", "Commercial", "Client Provided", "Restricted", "Internal Only"])
            can_be_disclosed = st.selectbox("Can Be Disclosed?", ["No", "Yes", "Partial"])
            qc_method = st.text_area("QC Method")
            status = st.selectbox("Status", ["Available", "Pending", "Used", "Rejected"])
            notes = st.text_area("Notes")
        if st.form_submit_button("Register QC Reference"):
            new = {"qc_id": f"QC-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}", "project_id": project_id, "reference_type": reference_type, "reference_provider": reference_provider, "accuracy_level": accuracy_level, "coverage": coverage, "license": license_type, "can_be_disclosed": can_be_disclosed, "qc_method": qc_method, "status": status, "notes": notes, "created_at": datetime.utcnow().isoformat()}
            df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
            save_csv("qc_reference_registry.csv", df)
            st.success("QC reference registered.")
    st.dataframe(df, use_container_width=True)


elif page == "Owner-Only Tile Key Release":
    st.title("Owner-Only Tile Key Release Mechanism")
    st.caption("All tile-level passwords, access tokens and download keys are issued exclusively to the platform owner.")
    st.warning(f"System rule: credentials must be sent only to the owner-designated email: {OWNER_EMAIL}. The system must not send tile credentials directly to clients, production partners, storage providers or third parties.")
    cols = ["key_id", "project_id", "client_name", "tile_id", "product_type", "file_url", "access_token", "credential_recipient", "released_by_owner", "forwarded_to_client", "release_scope", "payment_status", "expiry_date", "status", "created_at"]
    df = load_csv("owner_controlled_tile_access.csv", cols)
    with st.form("tile_key_form"):
        left, right = st.columns(2)
        with left:
            project_id = st.text_input("Project ID")
            client_name = st.text_input("Client Name")
            tile_id = st.text_input("Tile ID")
            product_type = st.selectbox("Product Type", ["DSM", "DOM", "DSM + DOM"])
            file_url = st.text_input("File URL")
        with right:
            release_scope = st.text_area("Release Scope")
            payment_status = st.selectbox("Payment Status", ["Unpaid", "Deposit Paid", "Paid", "Internal Test"])
            expiry_date = st.date_input("Expiry Date")
            status = st.selectbox("Status", ["Locked", "Released", "Revoked"])
            generate = st.checkbox("Generate new tile access token", value=True)
        if st.form_submit_button("Create Owner-Controlled Tile Key"):
            token = make_token() if generate else ""
            new = {"key_id": f"KEY-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}", "project_id": project_id, "client_name": client_name, "tile_id": tile_id, "product_type": product_type, "file_url": file_url, "access_token": token, "credential_recipient": OWNER_EMAIL, "released_by_owner": "No", "forwarded_to_client": "No", "release_scope": release_scope, "payment_status": payment_status, "expiry_date": str(expiry_date), "status": status, "created_at": datetime.utcnow().isoformat()}
            df = pd.concat([df, pd.DataFrame([new])], ignore_index=True)
            save_csv("owner_controlled_tile_access.csv", df)
            st.success(f"Tile key created. Credential recipient is locked to {OWNER_EMAIL}.")
    st.dataframe(df, use_container_width=True)


elif page == "Delivery Center":
    st.title("Delivery Center")
    st.caption("Factory release package standard.")
    st.code("""
StellarDEM_[Country-or-AOI]_[DSM-DOM]_[Resolution]_[Version]/
├── 01_DSM/
├── 02_DOM/
├── 03_Metadata/
├── 04_Tile_Index/
├── 05_QC_Report/
├── 06_Accuracy_Statement/
├── 07_Delivery_Note/
├── 08_License_Terms/
├── 09_User_Guide/
└── 10_Change_Log/
    """, language="text")
    st.markdown("""
    ### Factory Release Principle
    The client receives only the authorized delivery note, tile list, download link and owner-forwarded tile access keys.

    Internal access control logs and full credential tables are not disclosed to clients or partners.
    """)
