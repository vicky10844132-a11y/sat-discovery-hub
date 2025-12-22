/* app.js - minimal wiring for the HUD UI */

const $ = (sel) => document.querySelector(sel);

const map = L.map("map", {
  zoomControl: true,
  worldCopyJump: true,
}).setView([25, 10], 2);

// Basemap (swap as needed; keep attribution)
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

function renderCoverageIndex(items) {
  const root = $("#coverageIndex");
  root.innerHTML = "";
  items.forEach((it) => {
    const el = document.createElement("div");
    el.className = "indexItem";
    el.innerHTML = `
      <div class="indexTop">
        <div>
          <div class="indexName">${it.name}</div>
          <div class="indexDesc">${it.desc}</div>
        </div>
        <div class="indexMeta">
          <span class="tag">${it.tag}</span>
          <span class="pill ${it.status}">${it.status.toUpperCase()}</span>
        </div>
      </div>
    `;
    root.appendChild(el);
  });
}

function setAOISummary(text) {
  $("#aoiSummary").textContent = text;
}

async function geocode(place) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data?.length) return null;

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    display: data[0].display_name,
  };
}

$("#btnLocate").addEventListener("click", async () => {
  const place = $("#place").value.trim();
  if (!place) return;

  try {
    setAOISummary("Locating…");
    const hit = await geocode(place);
    if (!hit) {
      setAOISummary("No result. Try a more specific keyword.");
      return;
    }

    map.setView([hit.lat, hit.lon], 7);

    if (marker) marker.remove();
    marker = L.marker([hit.lat, hit.lon]).addTo(map);

    setAOISummary(`AOI centered at: ${hit.display} (${hit.lat.toFixed(5)}, ${hit.lon.toFixed(5)})`);
  } catch (e) {
    console.error(e);
    setAOISummary("Locate failed. Check network / rate limit.");
  }
});

$("#btnCheckCoverage").addEventListener("click", () => {
  const from = $("#fromMonth").value || "—";
  const to = $("#toMonth").value || "—";

  renderCoverageIndex([
    {
      name: "Archive Coverage Signal",
      desc: `Time window: ${from} → ${to}. (Reference indicator)`,
      tag: "STAC · Open",
      status: "ok",
    },
    {
      name: "Cloud / Noise Risk",
      desc: "Heuristic risk banding (mock). Replace with your metrics.",
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
});

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
});

$("#btnLoadFootprints").addEventListener("click", () => {
  if (footprintLayer) footprintLayer.remove();

  const poly = L.polygon(
    [
      [30, 10],
      [30, 30],
      [15, 30],
      [15, 10],
    ],
    {
      weight: 2,
      opacity: 0.9,
      fillOpacity: 0.12,
    }
  );

  footprintLayer = L.layerGroup([poly]).addTo(map);
  map.fitBounds(poly.getBounds(), { padding: [30, 30] });

  const root = $("#footprintIndex");
  root.innerHTML = `
    <div class="indexItem">
      <div class="indexTop">
        <div>
          <div class="indexName">Footprint Layer</div>
          <div class="indexDesc">Mock geometry loaded. Replace with STAC footprints.</div>
        </div>
        <div class="indexMeta">
          <span class="tag">GeoJSON</span>
          <span class="pill ok">OK</span>
        </div>
      </div>
    </div>
  `;
});

$("#btnClearFootprints").addEventListener("click", () => {
  if (footprintLayer) { footprintLayer.remove(); footprintLayer = null; }
  $("#footprintIndex").innerHTML = "";
});

$("#btnPlan").addEventListener("click", () => {
  const sat = $("#satName").value.trim() || "Unspecified";
  const root = $("#planIndex");
  root.innerHTML = `
    <div class="indexItem">
      <div class="indexTop">
        <div>
          <div class="indexName">Future Passes (Reference)</div>
          <div class="indexDesc">Satellite: ${sat}. This is a placeholder for your pass-planning engine.</div>
        </div>
        <div class="indexMeta">
          <span class="tag">Orbit</span>
          <span class="pill warn">MOCK</span>
        </div>
      </div>
    </div>
  `;
});

$("#btnPlanClear").addEventListener("click", () => {
  $("#planIndex").innerHTML = "";
});
