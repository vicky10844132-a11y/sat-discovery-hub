/* app.js - Neon HUD wiring (open-data reference only) */

const $ = (sel) => document.querySelector(sel);

function toast(title, body = "", ms = 2400) {
  const el = $("#toast");
  el.innerHTML = `
    <div class="tTitle">${escapeHtml(title)}</div>
    ${body ? `<div class="tBody">${escapeHtml(body)}</div>` : ""}
  `;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), ms);
}

function setBtnLoading(btn, isLoading) {
  if (!btn) return;
  btn.classList.toggle("isLoading", !!isLoading);
  btn.disabled = !!isLoading;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

/* ---------------- Map init ---------------- */
const map = L.map("map", {
  zoomControl: true,
  worldCopyJump: true,
  minZoom: 2,     // ✅ prevent infinite zoom-out
  maxZoom: 18
}).setView([25, 10], 2);

// Optional: keep map from drifting too far
map.setMaxBounds([[-85, -180], [85, 180]]);
map.on("drag", () => map.panInsideBounds(map.getMaxBounds(), { animate: false }));

// Basemaps (switchable)
const ESRI_DARK_GRAY = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 18,
    attribution: "Tiles © Esri — Esri, HERE, Garmin, OpenStreetMap contributors"
  }
);

const CARTO_DARK = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  {
    maxZoom: 19,
    subdomains: "abcd",
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }
);

let currentBase = null;

function setBasemap(mode) {
  const root = document.documentElement;
  root.setAttribute("data-basemap", mode);

  if (currentBase) {
    try { map.removeLayer(currentBase); } catch {}
  }

  if (mode === "carto") {
    currentBase = CARTO_DARK;
  } else {
    currentBase = ESRI_DARK_GRAY;
  }
  currentBase.addTo(map);

  toast("Basemap Updated", mode === "carto" ? "CARTO Dark (Neon)" : "Esri Dark Gray");
}

// default
setBasemap("esri");

let marker = null;
let footprintLayer = null;

(function setDefaultMonths() {
  const now = new Date();
  const y = now.getFullYear();
  $("#fromMonth").value = `${y}-01`;
  $("#toMonth").value = `${y}-12`;
})();

/* ---------------- UI helpers ---------------- */
function renderIndex(rootId, items) {
  const root = $(rootId);
  root.innerHTML = "";
  items.forEach((it) => {
    const el = document.createElement("div");
    el.className = "indexItem";
    el.innerHTML = `
      <div class="indexTop">
        <div>
          <div class="indexName">${escapeHtml(it.name)}</div>
          <div class="indexDesc">${escapeHtml(it.desc)}</div>
        </div>
        <div class="indexMeta">
          ${it.tag ? `<span class="tag">${escapeHtml(it.tag)}</span>` : ""}
          ${it.status ? `<span class="pill ${it.status}">${escapeHtml(it.status.toUpperCase())}</span>` : ""}
        </div>
      </div>
    `;
    root.appendChild(el);
  });
}

function setAOISummary(text) {
  $("#aoiSummary").textContent = text;
}

function getAOICenter() {
  if (!marker) return null;
  const ll = marker.getLatLng();
  return { lat: ll.lat, lon: ll.lng };
}

function monthRangeToDatetime(fromMonth, toMonth) {
  try {
    const [fy, fm] = fromMonth.split("-").map(Number);
    const [ty, tm] = toMonth.split("-").map(Number);
    const start = new Date(Date.UTC(fy, fm - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(ty, tm, 1, 0, 0, 0)); // next month 1st
    return `${start.toISOString()}/${end.toISOString()}`;
  } catch {
    return null;
  }
}

function bboxAround(lat, lon, deg = 1.2) {
  return [lon - deg, lat - deg, lon + deg, lat + deg];
}

/* ---------------- External data: sources.json & programming_satellites.json ---------------- */
async function loadSources() {
  try {
    const res = await fetch("./sources.json?v=" + Date.now(), { headers: {
