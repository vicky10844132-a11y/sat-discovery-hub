/* app.js - production-grade wiring for the HUD UI (open-data reference only) */

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
}).setView([25, 10], 2);

// Basemap (keep attribution)
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
}).addTo(map);

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
  // STAC datetime: inclusive start, exclusive end (best-effort)
  // fromMonth/toMonth format: YYYY-MM
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
  // small bbox around point, reference-only
  return [lon - deg, lat - deg, lon + deg, lat + deg];
}

/* ---------------- External data: sources.json & programming_satellites.json ---------------- */
async function loadSources() {
  try {
    const res = await fetch("./sources.json?v=" + Date.now(), { headers: { "Accept": "application/json" } });
    if (!res.ok) return;
    const data = await res.json();
    if (!Array.isArray(data?.sources)) return;

    const root = $("#sourcesList");
    root.innerHTML = "";
    data.sources.forEach((s) => {
      const el = document.createElement("div");
      el.className = "source";
      el.innerHTML = `
        <div class="sourceTop">
          <div class="sourceName">${escapeHtml(s.name || "Source")}</div>
          <span class="pill ${escapeHtml((s.badgeClass || "ok"))}">${escapeHtml(s.badge || "Public")}</span>
        </div>
        <div class="sourceDesc">${escapeHtml(s.desc || "")}</div>
      `;
      root.appendChild(el);
    });
  } catch {
    // silent fallback to static sources
  }
}

async function loadProgrammingHints() {
  try {
    const res = await fetch("./programming_satellites.json?v=" + Date.now(), { headers: { "Accept": "application/json" } });
    if (!res.ok) return;
    const data = await res.json();
    const items = Array.isArray(data?.satellites) ? data.satellites : [];
    const dl = $("#satHints");
    dl.innerHTML = "";
    items.slice(0, 400).forEach((it) => {
      const opt = document.createElement("option");
      opt.value = it.name || "";
      dl.appendChild(opt);
    });
  } catch {
    // optional
  }
}

loadSources();
loadProgrammingHints();

/* ---------------- Nominatim geocode (rate-limited public) ---------------- */
async function geocode(place) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  // Note: browsers send Referer; Nominatim may rate-limit regardless. Handle gracefully.

  const res = await fetch(url.toString(), { headers: { "Accept": "application/json" } });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Rate limited (429). Try again later.");
    throw new Error("Geocoding failed");
  }
  const data = await res.json();
  if (!data?.length) return null;

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    display: data[0].display_name,
  };
}

async function doLocate() {
  const btn = $("#btnLocate");
  const place = $("#place").value.trim();
  if (!place) {
    toast("Place is empty", "Please input a place keyword.");
    return;
  }

  try {
    setBtnLoading(btn, true);
    setAOISummary("Locating…");
    const hit = await geocode(place);

    if (!hit) {
      setAOISummary("No result. Try a more specific keyword.");
      toast("No result", "Try adding country/city details.");
      return;
    }

    map.setView([hit.lat, hit.lon], 7);

    if (marker) marker.remove();
    marker = L.marker([hit.lat, hit.lon]).addTo(map);

    setAOISummary(`AOI centered at: ${hit.display} (${hit.lat.toFixed(5)}, ${hit.lon.toFixed(5)})`);
    toast("AOI set", `${hit.display}`);

  } catch (e) {
    console.error(e);
    setAOISummary("Locate failed. Check network / rate limit.");
    toast("Locate failed", e?.message || "Network or rate limit.");
  } finally {
    setBtnLoading(btn, false);
  }
}

$("#btnLocate").addEventListener("click", doLocate);
$("#place").addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") doLocate();
});

/* ---------------- Coverage (reference indicator) ---------------- */
$("#btnCheckCoverage").addEventListener("click", () => {
  const from = $("#fromMonth").value || "—";
  const to = $("#toMonth").value || "—";

  renderIndex("#coverageIndex", [
    {
      name: "Archive Coverage Signal",
      desc: `Time window: ${from} → ${to}. (Reference indicator)`,
      tag: "STAC · Open",
      status: "ok",
    },
    {
      name: "Cloud / Noise Risk",
      desc: "Heuristic risk banding (placeholder). Replace with your actual QA metrics.",
      tag: "QA",
      status: "warn",
    },
    {
      name: "Acquisition Availability",
      desc: "Catalog presence only; not a guarantee of delivery.",
      tag: "Index",
      status: "ok",
    },
  ]);

  toast("Coverage updated", "Reference indicators refreshed.");
});

/* ---------------- Reset ---------------- */
$("#btnReset").addEventListener("click", () => {
  $("#place").value = "";
  $("#stacUrl").value = "";
  $("#satName").value = "";
  $("#coverageIndex").innerHTML = "";
  $("#footprintIndex").innerHTML = "";
  $("#planIndex").innerHTML = "";
  setAOISummary("No AOI set. Use place search or draw/select on map (if enabled).");

  if (marker) { marker.remove(); marker = null; }
  if (footprintLayer) { footprintLayer.remove(); footprintLayer = null; }

  map.setView([25, 10], 2);
  toast("Reset", "UI state cleared.");
});

/* ---------------- STAC footprints (real attempt + fallback) ---------------- */
async function stacSearch(stacUrl, bbox, datetime) {
  // Try GET first (some endpoints allow it), then POST /search (STAC API)
  // Expect GeoJSON FeatureCollection with features[].geometry
  const base = stacUrl.replace(/\/+$/, "");
  const searchUrl = base.endsWith("/search") ? base : (base + "/search");

  // GET
  try {
    const u = new URL(searchUrl);
    u.searchParams.set("limit", "50");
    u.searchParams.set("bbox", bbox.join(","));
    if (datetime) u.searchParams.set("datetime", datetime);

    const res = await fetch(u.toString(), { headers: { "Accept": "application/geo+json,application/json" } });
    if (res.ok) return await res.json();
  } catch {
    // ignore; fallback to POST
  }

  // POST
  const payload = {
    limit: 50,
    bbox,
    datetime: datetime || undefined,
  };

  const res = await fetch(searchUrl, {
    method: "POST",
    headers: {
      "Accept": "application/geo+json,application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("STAC rate limited (429). Try later.");
    throw new Error(`STAC /search failed (${res.status})`);
  }
  return await res.json();
}

function drawFootprintsFromGeoJSON(geojson) {
  if (!geojson) return null;

  // Support FeatureCollection or single Feature
  const fc = geojson.type === "FeatureCollection"
    ? geojson
    : (geojson.type === "Feature" ? { type: "FeatureCollection", features: [geojson] } : null);

  if (!fc?.features?.length) return null;

  const layer = L.geoJSON(fc, {
    style: () => ({
      weight: 2,
      opacity: 0.95,
      fillOpacity: 0.10,
    }),
  });

  return layer;
}

async function doLoadFootprints() {
  const btn = $("#btnLoadFootprints");
  const stacUrl = $("#stacUrl").value.trim();
  const aoi = getAOICenter();

  // Clear existing
  if (footprintLayer) { footprintLayer.remove(); footprintLayer = null; }
  $("#footprintIndex").innerHTML = "";

  // If no AOI, refuse politely (production-grade UX)
  if (!aoi) {
    toast("AOI required", "Please locate a place first so we can set a reference AOI.");
    renderIndex("#footprintIndex", [{
      name: "Footprints blocked",
      desc: "No AOI set. Use AOI Setup (Locate) first.",
      tag: "Guardrail",
      status: "warn",
    }]);
    return;
  }

  const from = $("#fromMonth").value || "";
  const to = $("#toMonth").value || "";
  const datetime = (from && to) ? monthRangeToDatetime(from, to) : null;

  try {
    setBtnLoading(btn, true);

    // If no STAC URL -> fallback demo geometry (UI-only mode)
    if (!stacUrl) {
      const poly = L.polygon(
        [
          [aoi.lat + 1.0, aoi.lon - 1.2],
          [aoi.lat + 1.0, aoi.lon + 1.2],
          [aoi.lat - 1.0, aoi.lon + 1.2],
          [aoi.lat - 1.0, aoi.lon - 1.2],
        ],
        { weight: 2, opacity: 0.9, fillOpacity: 0.12 }
      );
      footprintLayer = L.layerGroup([poly]).addTo(map);
      map.fitBounds(poly.getBounds(), { padding: [30, 30] });

      renderIndex("#footprintIndex", [{
        name: "Footprint Layer (UI-only)",
        desc: "No STAC endpoint provided. Mock geometry rendered for UX validation.",
        tag: "Mock",
        status: "warn",
      }]);

      toast("Footprints loaded", "UI-only mock geometry.");
      return;
    }

    // Real STAC attempt
    const bbox = bboxAround(aoi.lat, aoi.lon, 1.2);
    const geojson = await stacSearch(stacUrl, bbox, datetime);

    const layer = drawFootprintsFromGeoJSON(geojson);
    if (!layer) {
      renderIndex("#footprintIndex", [{
        name: "No footprints returned",
        desc: "STAC responded but no features were found for this bbox/time window.",
        tag: "STAC",
        status: "warn",
      }]);
      toast("No footprints", "Try a wider bbox or different time range.");
      return;
    }

    footprintLayer = layer.addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [30, 30] });

    const count = geojson?.features?.length || 0;
    renderIndex("#footprintIndex", [
      {
        name: "STAC Footprints Loaded",
        desc: `Features: ${count}. bbox: [${bbox.map(n => n.toFixed(2)).join(", ")}]`,
        tag: "GeoJSON",
        status: "ok",
      },
      {
        name: "CORS / Access Note",
        desc: "Some STAC endpoints block browser calls. If you see failures, proxy the request server-side.",
        tag: "Ops",
        status: "warn",
      },
    ]);

    toast("Footprints loaded", `STAC features: ${count}`);

  } catch (e) {
    console.error(e);

    renderIndex("#footprintIndex", [
      {
        name: "STAC request failed",
        desc: e?.message || "Network/CORS/endpoint error.",
        tag: "STAC",
        status: "no",
      },
      {
        name: "Recommended fix (production)",
        desc: "Add a lightweight server proxy (Cloudflare Worker / Vercel Edge) to avoid CORS and rate limits.",
        tag: "Infra",
        status: "warn",
      },
    ]);

    toast("Footprints failed", e?.message || "CORS or endpoint error.");
  } finally {
    setBtnLoading(btn, false);
  }
}

$("#btnLoadFootprints").addEventListener("click", doLoadFootprints);

$("#btnClearFootprints").addEventListener("click", () => {
  if (footprintLayer) { footprintLayer.remove(); footprintLayer = null; }
  $("#footprintIndex").innerHTML = "";
  toast("Footprints cleared", "Layer removed.");
});

/* ---------------- Programming (reference only) ---------------- */
$("#btnPlan").addEventListener("click", () => {
  const sat = $("#satName").value.trim() || "Unspecified";
  const aoi = getAOICenter();
  const aoiText = aoi ? `${aoi.lat.toFixed(4)}, ${aoi.lon.toFixed(4)}` : "No AOI";

  renderIndex("#planIndex", [
    {
      name: "Future Passes (Reference)",
      desc: `Satellite: ${sat}. AOI: ${aoiText}. This is a UI-level placeholder for your pass-planning engine.`,
      tag: "Orbit",
      status: "warn",
    },
    {
      name: "Production plug-in points",
      desc: "Use SGP4 + ground-station geometry + constraints (elevation mask, off-nadir, cloud risk) to compute actual windows.",
      tag: "Engineering",
      status: "ok",
    },
  ]);

  toast("Programming generated", "Reference panel updated.");
});

$("#btnPlanClear").addEventListener("click", () => {
  $("#planIndex").innerHTML = "";
  toast("Programming cleared", "Panel cleared.");
});

/* ---------------- Quality-of-life ---------------- */
// Keep Leaflet map responsive when panel scroll changes layout (rare but safe)
window.addEventListener("resize", () => {
  try { map.invalidateSize(); } catch {}
});
