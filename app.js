let ALL = [];
let LAST_FILTERED = [];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}

const norm = (s) => (s || "").toString().toLowerCase().trim();
const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

function accessBucket(accessText) {
  const a = norm(accessText);
  if (!a) return "";
  if (a.includes("public") || a.includes("open")) return "public";
  if (a.includes("login") || a.includes("account")) return "login";
  if (a.includes("commercial")) return "commercial";
  return "";
}

async function loadSources() {
  const res = await fetch("./sources.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load sources.json (${res.status})`);
  ALL = await res.json();
}

function buildUI() {
  const mount = document.getElementById("app");
  mount.innerHTML = "";

  const wrap = el("div", { class: "wrap" });

  const title = el("div", { class: "h2", text: "Sources" });

  // Controls
  const controls = el("div", { class: "controls" });

  const q = el("input", { class: "input", type: "search", id: "q", placeholder: "Search name / operator / notes…" });

  // Sensor chips
  const sensorGroup = el("div", { class: "group" }, [
    el("div", { class: "label", text: "Sensor" })
  ]);

  const sensors = [
    { id: "f_optical", label: "Optical", value: "optical" },
    { id: "f_sar", label: "SAR", value: "sar" },
    { id: "f_video", label: "Video", value: "video" }
  ];

  sensors.forEach(s => {
    sensorGroup.appendChild(
      el("label", { class: "chip" }, [
        el("input", { type: "checkbox", id: s.id, value: s.value }),
        el("span", { }, [s.label])
      ])
    );
  });

  // Coverage select (from data)
  const covSelect = el("select", { class: "select", id: "coverage" });
  covSelect.appendChild(el("option", { value: "", text: "All coverage" }));
  uniq(ALL.map(x => x.coverage)).sort().forEach(c => covSelect.appendChild(el("option", { value: c, text: c })));

  const covGroup = el("div", { class: "group" }, [
    el("div", { class: "label", text: "Coverage" }),
    covSelect
  ]);

  // Access select
  const accessSelect = el("select", { class: "select", id: "access" });
  accessSelect.appendChild(el("option", { value: "", text: "All access" }));
  accessSelect.appendChild(el("option", { value: "public", text: "Public / Open" }));
  accessSelect.appendChild(el("option", { value: "login", text: "Login required" }));
  accessSelect.appendChild(el("option", { value: "commercial", text: "Commercial" }));

  const accessGroup = el("div", { class: "group" }, [
    el("div", { class: "label", text: "Access" }),
    accessSelect
  ]);

  const resetBtn = el("button", { class: "btn", id: "reset", text: "Reset" });

  const stats = el("div", { class: "stats", id: "stats", text: "—" });

  controls.appendChild(q);
  controls.appendChild(sensorGroup);
  controls.appendChild(covGroup);
  controls.appendChild(accessGroup);
  controls.appendChild(resetBtn);
  controls.appendChild(stats);

  // Actions
  const actions = el("div", { class: "actions" });
  const copyLinkBtn = el("button", { class: "btn btnPrimary", id: "copyLink", text: "Copy share link" });
  const copyListBtn = el("button", { class: "btn", id: "copyList", text: "Copy results (text)" });
  const exportBtn = el("button", { class: "btn", id: "exportCsv", text: "Export CSV" });

  actions.appendChild(copyLinkBtn);
  actions.appendChild(copyListBtn);
  actions.appendChild(exportBtn);

  const toast = el("div", { class: "toast", id: "toast" });
  const list = el("div", { class: "list", id: "list" });

  const hint = el("div", { class: "footerHint" }, [
    "Tip: Filters are encoded in the URL for sharing. ",
    "This site indexes public discovery portals only."
  ]);

  wrap.appendChild(title);
  wrap.appendChild(controls);
  wrap.appendChild(actions);
  wrap.appendChild(toast);
  wrap.appendChild(list);
  wrap.appendChild(hint);

  mount.appendChild(wrap);

  // Events
  const rerender = () => { syncURLFromFilters(); render(); };
  q.addEventListener("input", rerender);
  sensors.forEach(s => document.getElementById(s.id).addEventListener("change", rerender));
  covSelect.addEventListener("change", rerender);
  accessSelect.addEventListener("change", rerender);

  resetBtn.addEventListener("click", () => {
    q.value = "";
    sensors.forEach(s => (document.getElementById(s.id).checked = false));
    covSelect.value = "";
    accessSelect.value = "";
    syncURLFromFilters();
    render();
  });

  copyLinkBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(new URL(window.location.href).toString());
      showToast("Share link copied.");
    } catch {
      showToast("Copy failed. Copy from address bar.");
    }
  });

  copyListBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildTextList(LAST_FILTERED));
      showToast("Results copied as text.");
    } catch {
      showToast("Copy failed (browser permission).");
    }
  });

  exportBtn.addEventListener("click", () => {
    downloadText(buildCsv(LAST_FILTERED), "satellite-discovery-sources.csv", "text/csv;charset=utf-8");
    showToast("CSV exported.");
  });
}

function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(() => t.classList.remove("show"), 1200);
}

function getFilters() {
  const q = norm(document.getElementById("q")?.value);
  const cov = document.getElementById("coverage")?.value || "";
  const access = document.getElementById("access")?.value || "";

  const sensorWanted = [];
  ["f_optical", "f_sar", "f_video"].forEach(id => {
    const cb = document.getElementById(id);
    if (cb?.checked) sensorWanted.push(cb.value);
  });

  return { q, cov, access, sensorWanted };
}

function match(item, f) {
  // keyword
  if (f.q) {
    const hay = norm(
      `${item.name || ""} ${item.operator || ""} ${item.notes || ""} ${(item.sensor || []).join(" ")} ${item.coverage || ""} ${item.access || ""}`
    );
    if (!hay.includes(f.q)) return false;
  }

  // coverage
  if (f.cov && (item.coverage || "") !== f.cov) return false;

  // access bucket
  if (f.access) {
    const b = accessBucket(item.access);
    if (b !== f.access) return false;
  }

  // sensor
  if (f.sensorWanted.length) {
    const s = (item.sensor || []).map(norm);
    if (!f.sensorWanted.some(w => s.includes(w))) return false;
  }

  return true;
}

/* URL sync: q/cov/acc/sen */
function syncURLFromFilters() {
  const f = getFilters();
  const url = new URL(window.location.href);

  if (f.q) url.searchParams.set("q", f.q); else url.searchParams.delete("q");
  if (f.cov) url.searchParams.set("cov", f.cov); else url.searchParams.delete("cov");
  if (f.access) url.searchParams.set("acc", f.access); else url.searchParams.delete("acc");
  if (f.sensorWanted.length) url.searchParams.set("sen", f.sensorWanted.join(",")); else url.searchParams.delete("sen");

  history.replaceState(null, "", url.toString());
}

function applyFiltersFromURL() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get("q") || "";
  const cov = url.searchParams.get("cov") || "";
  const acc = url.searchParams.get("acc") || "";
  const sen = url.searchParams.get("sen") || "";

  const qEl = document.getElementById("q");
  const covEl = document.getElementById("coverage");
  const accEl = document.getElementById("access");

  if (qEl) qEl.value = q;
  if (covEl && cov) covEl.value = cov;
  if (accEl && acc) accEl.value = acc;

  const wanted = sen.split(",").map(norm).filter(Boolean);
  const map = { optical: "f_optical", sar: "f_sar", video: "f_video" };

  Object.values(map).forEach(id => {
    const cb = document.getElementById(id);
    if (cb) cb.checked = false;
  });
  wanted.forEach(w => {
    const id = map[w];
    if (id) {
      const cb = document.getElementById(id);
      if (cb) cb.checked = true;
    }
  });
}

/* Copy + Export */
function buildTextList(list) {
  const lines = [];
  lines.push("Satellite Discovery Index — filtered results");
  lines.push(`Count: ${list.length}`);
  lines.push(`Link: ${window.location.href}`);
  lines.push("");
  list.forEach((s, i) => {
    lines.push(`${i + 1}. ${s.name || "Unnamed"}`);
    if (s.operator) lines.push(`   Operator: ${s.operator}`);
    lines.push(`   Coverage: ${s.coverage || "—"} | Sensor: ${(s.sensor || []).join(", ") || "—"} | Access: ${s.access || "—"}`);
    lines.push(`   URL: ${s.url}`);
    if (s.notes) lines.push(`   Notes: ${s.notes}`);
    lines.push("");
  });
  return lines.join("\n");
}

function buildCsv(list) {
  const header = ["name","operator","coverage","sensor","access","url","notes"];
  const rows = [header.join(",")];
  const esc = (v) => `"${(v ?? "").toString().replaceAll('"','""')}"`;

  list.forEach(x => {
    rows.push([
      esc(x.name),
      esc(x.operator),
      esc(x.coverage),
      esc((x.sensor || []).join("|")),
      esc(x.access),
      esc(x.url),
      esc(x.notes)
    ].join(","));
  });

  return rows.join("\n");
}

function downloadText(text, filename, mime) {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 0);
}

function render() {
  const list = document.getElementById("list");
  const stats = document.getElementById("stats");
  if (!list || !stats) return;

  const f = getFilters();
  const filtered = ALL.filter(x => match(x, f));
  LAST_FILTERED = filtered;

  filtered.sort((a, b) => {
    const ca = (a.coverage || "").localeCompare(b.coverage || "");
    if (ca !== 0) return ca;
    return (a.name || "").localeCompare(b.name || "");
  });

  stats.textContent = `${filtered.length} / ${ALL.length} sources`;

  list.innerHTML = "";
  filtered.forEach(src => {
    const title = `${src.name || "Unnamed"} (${src.coverage || "—"}, ${(src.sensor || []).join(", ") || "—"})`;
    const a = el("a", { class: "link", href: src.url, target: "_blank", rel: "noopener noreferrer" }, [title]);

    const meta = el("div", { class: "meta" }, [
      (src.operator ? `Operator: ${src.operator}` : "Operator: —"),
      " · ",
      (src.access ? `Access: ${src.access}` : "Access: —")
    ]);

    const note = el("div", { class: "note" }, [src.notes || ""]);

    list.appendChild(el("div", { class: "card" }, [a, meta, note]));
  });

  if (!filtered.length) {
    list.appendChild(el("div", { class: "empty" }, ["No sources match your filters."]));
  }
}

(async function main(){
  try {
    await loadSources();
    buildUI();
    applyFiltersFromURL();
    render();
  } catch (e) {
    const mount = document.getElementById("app");
    mount.innerHTML = "";
    mount.appendChild(el("div", { class: "error" }, [`Failed to load sources. ${e.message}`]));
  }
})();
