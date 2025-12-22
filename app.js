let ALL = [];
let LAST_FILTERED = [];

const LS_KEY = "sdi_filters_v1";

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

function safeArr(v) { return Array.isArray(v) ? v : (v ? [v] : []); }

function accessBucket(accessText) {
  const a = norm(accessText);
  if (!a) return "";
  if (a.includes("public") || a.includes("open")) return "public";
  if (a.includes("login") || a.includes("account")) return "login";
  if (a.includes("commercial")) return "commercial";
  return "";
}

function toISODate(d) {
  // Expect YYYY-MM-DD, else empty
  const s = (d || "").toString().trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

function daysSince(iso) {
  const s = toISODate(iso);
  if (!s) return Infinity;
  const dt = new Date(s + "T00:00:00Z");
  const now = new Date();
  const diff = (now.getTime() - dt.getTime()) / 86400000;
  return Math.floor(diff);
}

function isHttps(url) {
  return /^https:\/\//i.test((url || "").toString().trim());
}

async function loadSources() {
  const res = await fetch("./sources.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load sources.json (${res.status})`);
  const data = await res.json();

  // Backward compatibility: normalize records
  ALL = (Array.isArray(data) ? data : []).map(x => ({
    id: (x.id || "").toString().trim(),
    name: (x.name || "").toString().trim(),
    operator: (x.operator || "").toString().trim(),
    url: (x.url || "").toString().trim(),
    sensor: safeArr(x.sensor).map(v => v.toString().trim()).filter(Boolean),
    coverage: (x.coverage || "").toString().trim() || "global",
    access: (x.access || "").toString().trim(),
    category: (x.category || "").toString().trim() || "",          // commercial/government/open/aggregator/research
    updated: toISODate(x.updated || ""),                           // YYYY-MM-DD
    evidence_url: (x.evidence_url || "").toString().trim(),
    notes: (x.notes || "").toString().trim()
  }));
}

function buildUI() {
  const mount = document.getElementById("app");
  mount.innerHTML = "";

  const wrap = el("div", { class: "wrap" });

  // Title row + quick pills
  const title = el("div", { class: "h2", text: "Sources" });

  const pills = el("div", { class: "pills" }, [
    el("button", { class: "pill", id: "pill_all", text: "All" }),
    el("button", { class: "pill", id: "pill_new30", text: "New/Updated (30d)" }),
    el("button", { class: "pill", id: "pill_new90", text: "New/Updated (90d)" }),
    el("button", { class: "pill", id: "pill_public", text: "Public/Open" }),
    el("button", { class: "pill", id: "pill_china", text: "China" }),
    el("button", { class: "pill", id: "pill_sar", text: "SAR" })
  ]);

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
    { id: "f_video", label: "Video", value: "video" },
    { id: "f_dem", label: "DEM", value: "dem" }
  ];

  const chipsWrap = el("div", { class: "chips" });
  sensors.forEach(s => {
    chipsWrap.appendChild(
      el("label", { class: "chip" }, [
        el("input", { type: "checkbox", id: s.id, value: s.value }),
        el("span", {}, [s.label])
      ])
    );
  });
  sensorGroup.appendChild(chipsWrap);

  // Coverage select (from data)
  const covSelect = el("select", { class: "select", id: "coverage" });
  covSelect.appendChild(el("option", { value: "", text: "All coverage" }));
  uniq(ALL.map(x => x.coverage)).sort().forEach(c => covSelect.appendChild(el("option", { value: c, text: c })));

  const covGroup = el("div", { class: "group" }, [
    el("div", { class: "label", text: "Coverage" }),
    covSelect
  ]);

  // Category select
  const catSelect = el("select", { class: "select", id: "category" });
  catSelect.appendChild(el("option", { value: "", text: "All categories" }));
  // offer common buckets + discovered values
  const commonCats = ["commercial","government","open","aggregator","research"];
  const foundCats = uniq(ALL.map(x => x.category)).filter(Boolean);
  uniq([...commonCats, ...foundCats]).forEach(c => catSelect.appendChild(el("option", { value: c, text: c })));

  const catGroup = el("div", { class: "group" }, [
    el("div", { class: "label", text: "Category" }),
    catSelect
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

  // Sort
  const sortSelect = el("select", { class: "select", id: "sort" });
  [
    ["updated_desc","Sort: Updated (newest)"],
    ["name_asc","Sort: Name (A→Z)"],
    ["coverage_asc","Sort: Coverage"],
    ["category_asc","Sort: Category"]
  ].forEach(([v,t]) => sortSelect.appendChild(el("option",{value:v,text:t})));

  const sortGroup = el("div", { class: "group" }, [
    el("div", { class: "label", text: "Sort" }),
    sortSelect
  ]);

  const resetBtn = el("button", { class: "btn", id: "reset", text: "Reset" });

  const stats = el("div", { class: "stats", id: "stats", text: "—" });

  controls.appendChild(q);
  controls.appendChild(sensorGroup);
  controls.appendChild(covGroup);
  controls.appendChild(catGroup);
  controls.appendChild(accessGroup);
  controls.appendChild(sortGroup);
  controls.appendChild(resetBtn);

  // Actions
  const actions = el("div", { class: "actions" });
  const copyLinkBtn = el("button", { class: "btn btnPrimary", id: "copyLink", text: "Copy share link" });
  const copyTextBtn = el("button", { class: "btn", id: "copyText", text: "Copy results (text)" });
  const copyMdBtn = el("button", { class: "btn", id: "copyMd", text: "Copy results (markdown)" });
  const exportBtn = el("button", { class: "btn", id: "exportCsv", text: "Export CSV" });

  actions.appendChild(copyLinkBtn);
  actions.appendChild(copyTextBtn);
  actions.appendChild(copyMdBtn);
  actions.appendChild(exportBtn);

  const toast = el("div", { class: "toast", id: "toast" });
  const statsRow = el("div", { class: "statsRow" }, [stats, pills]);
  const list = el("div", { class: "list", id: "list" });

  const hint = el("div", { class: "footerHint" }, [
    "Tip: Filters are encoded in the URL for sharing. ",
    "This site indexes public discovery portals only."
  ]);

  wrap.appendChild(title);
  wrap.appendChild(controls);
  wrap.appendChild(actions);
  wrap.appendChild(toast);
  wrap.appendChild(statsRow);
  wrap.appendChild(list);
  wrap.appendChild(hint);

  mount.appendChild(wrap);

  // Events
  const rerender = () => { syncURLFromFilters(); saveFiltersLocal(); render(); };
  q.addEventListener("input", rerender);
  sensors.forEach(s => document.getElementById(s.id).addEventListener("change", rerender));
  covSelect.addEventListener("change", rerender);
  catSelect.addEventListener("change", rerender);
  accessSelect.addEventListener("change", rerender);
  sortSelect.addEventListener("change", rerender);

  resetBtn.addEventListener("click", () => {
    q.value = "";
    sensors.forEach(s => (document.getElementById(s.id).checked = false));
    covSelect.value = "";
    catSelect.value = "";
    accessSelect.value = "";
    sortSelect.value = "updated_desc";
    syncURLFromFilters();
    saveFiltersLocal();
    render();
  });

  // Quick pills
  document.getElementById("pill_all").addEventListener("click", () => {
    document.getElementById("q").value = "";
    sensors.forEach(s => (document.getElementById(s.id).checked = false));
    covSelect.value = "";
    catSelect.value = "";
    accessSelect.value = "";
    rerender();
  });

  document.getElementById("pill_new30").addEventListener("click", () => {
    setSpecial("recent", "30");
    rerender();
  });
  document.getElementById("pill_new90").addEventListener("click", () => {
    setSpecial("recent", "90");
    rerender();
  });
  document.getElementById("pill_public").addEventListener("click", () => {
    accessSelect.value = "public";
    rerender();
  });
  document.getElementById("pill_china").addEventListener("click", () => {
    covSelect.value = "china";
    rerender();
  });
  document.getElementById("pill_sar").addEventListener("click", () => {
    document.getElementById("f_sar").checked = true;
    rerender();
  });

  // Actions
  copyLinkBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(new URL(window.location.href).toString());
      showToast("Share link copied.");
    } catch {
      showToast("Copy failed. Copy from address bar.");
    }
  });

  copyTextBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildTextList(LAST_FILTERED));
      showToast("Results copied as text.");
    } catch {
      showToast("Copy failed (browser permission).");
    }
  });

  copyMdBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdownList(LAST_FILTERED));
      showToast("Results copied as markdown.");
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

/* Special URL param: recent=30|90 */
function setSpecial(key, val) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, val);
  history.replaceState(null, "", url.toString());
}
function getSpecialRecent() {
  const url = new URL(window.location.href);
  const r = url.searchParams.get("recent") || "";
  const n = parseInt(r, 10);
  if (n === 30 || n === 90) return n;
  return 0;
}
function clearSpecialRecent() {
  const url = new URL(window.location.href);
  url.searchParams.delete("recent");
  history.replaceState(null, "", url.toString());
}

function getFilters() {
  const q = norm(document.getElementById("q")?.value);
  const cov = document.getElementById("coverage")?.value || "";
  const cat = document.getElementById("category")?.value || "";
  const access = document.getElementById("access")?.value || "";
  const sort = document.getElementById("sort")?.value || "updated_desc";

  const sensorWanted = [];
  ["f_optical","f_sar","f_video","f_dem"].forEach(id => {
    const cb = document.getElementById(id);
    if (cb?.checked) sensorWanted.push(cb.value);
  });

  return { q, cov, cat, access, sort, sensorWanted };
}

function match(item, f) {
  // keyword
  if (f.q) {
    const hay = norm(
      `${item.name} ${item.operator} ${item.notes} ${(item.sensor||[]).join(" ")} ${item.coverage} ${item.access} ${item.category}`
    );
    if (!hay.includes(f.q)) return false;
  }

  // coverage
  if (f.cov && item.coverage !== f.cov) return false;

  // category
  if (f.cat && norm(item.category) !== norm(f.cat)) return false;

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

  // recent special (30/90 days)
  const recent = getSpecialRecent();
  if (recent) {
    const d = daysSince(item.updated);
    if (!(d <= recent)) return false;
  }

  return true;
}

/* URL sync: q/cov/cat/acc/sen/sort + keep recent */
function syncURLFromFilters() {
  const f = getFilters();
  const url = new URL(window.location.href);

  if (f.q) url.searchParams.set("q", f.q); else url.searchParams.delete("q");
  if (f.cov) url.searchParams.set("cov", f.cov); else url.searchParams.delete("cov");
  if (f.cat) url.searchParams.set("cat", f.cat); else url.searchParams.delete("cat");
  if (f.access) url.searchParams.set("acc", f.access); else url.searchParams.delete("acc");
  if (f.sensorWanted.length) url.searchParams.set("sen", f.sensorWanted.join(",")); else url.searchParams.delete("sen");
  if (f.sort && f.sort !== "updated_desc") url.searchParams.set("sort", f.sort); else url.searchParams.delete("sort");

  history.replaceState(null, "", url.toString());
}

function applyFiltersFromURL() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get("q") || "";
  const cov = url.searchParams.get("cov") || "";
  const cat = url.searchParams.get("cat") || "";
  const acc = url.searchParams.get("acc") || "";
  const sen = url.searchParams.get("sen") || "";
  const sort = url.searchParams.get("sort") || "updated_desc";

  const qEl = document.getElementById("q");
  const covEl = document.getElementById("coverage");
  const catEl = document.getElementById("category");
  const accEl = document.getElementById("access");
  const sortEl = document.getElementById("sort");

  if (qEl) qEl.value = q;
  if (covEl && cov) covEl.value = cov;
  if (catEl && cat) catEl.value = cat;
  if (accEl && acc) accEl.value = acc;
  if (sortEl && sort) sortEl.value = sort;

  const wanted = sen.split(",").map(norm).filter(Boolean);
  const map = { optical: "f_optical", sar: "f_sar", video: "f_video", dem: "f_dem" };
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

function loadFiltersLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveFiltersLocal() {
  try {
    const f = getFilters();
    localStorage.setItem(LS_KEY, JSON.stringify(f));
  } catch {}
}
function applyFiltersLocalIfNoURL() {
  const url = new URL(window.location.href);
  const hasAny =
    url.searchParams.get("q") || url.searchParams.get("cov") || url.searchParams.get("cat") ||
    url.searchParams.get("acc") || url.searchParams.get("sen") || url.searchParams.get("sort") ||
    url.searchParams.get("recent");
  if (hasAny) return;

  const f = loadFiltersLocal();
  if (!f) return;

  const qEl = document.getElementById("q");
  const covEl = document.getElementById("coverage");
  const catEl = document.getElementById("category");
  const accEl = document.getElementById("access");
  const sortEl = document.getElementById("sort");

  if (qEl) qEl.value = f.q || "";
  if (covEl) covEl.value = f.cov || "";
  if (catEl) catEl.value = f.cat || "";
  if (accEl) accEl.value = f.access || "";
  if (sortEl) sortEl.value = f.sort || "updated_desc";

  const wanted = (f.sensorWanted || []).map(norm);
  const map = { optical: "f_optical", sar: "f_sar", video: "f_video", dem: "f_dem" };
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

  syncURLFromFilters();
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
    lines.push(`   Coverage: ${s.coverage || "—"} | Sensor: ${(s.sensor || []).join(", ") || "—"} | Access: ${s.access || "—"} | Category: ${s.category || "—"}`);
    if (s.updated) lines.push(`   Updated: ${s.updated}`);
    lines.push(`   URL: ${s.url}`);
    if (s.evidence_url) lines.push(`   Evidence: ${s.evidence_url}`);
    if (s.notes) lines.push(`   Notes: ${s.notes}`);
    lines.push("");
  });
  return lines.join("\n");
}

function buildMarkdownList(list) {
  const lines = [];
  lines.push(`# Satellite Discovery Index — filtered results`);
  lines.push(`- Count: **${list.length}**`);
  lines.push(`- Link: ${window.location.href}`);
  lines.push("");
  list.forEach((s) => {
    const title = s.name || "Unnamed";
    const meta = [
      s.coverage ? `Coverage: ${s.coverage}` : null,
      (s.sensor && s.sensor.length) ? `Sensor: ${s.sensor.join(", ")}` : null,
      s.access ? `Access: ${s.access}` : null,
      s.category ? `Category: ${s.category}` : null,
      s.updated ? `Updated: ${s.updated}` : null
    ].filter(Boolean).join(" | ");

    lines.push(`- **${title}** — ${meta}`);
    if (s.operator) lines.push(`  - Operator: ${s.operator}`);
    lines.push(`  - Portal: ${s.url}`);
    if (s.evidence_url) lines.push(`  - Evidence: ${s.evidence_url}`);
    if (s.notes) lines.push(`  - Notes: ${s.notes}`);
  });
  lines.push("");
  return lines.join("\n");
}

function buildCsv(list) {
  const header = ["id","name","operator","coverage","sensor","access","category","updated","url","evidence_url","notes"];
  const rows = [header.join(",")];
  const esc = (v) => `"${(v ?? "").toString().replaceAll('"','""')}"`;

  list.forEach(x => {
    rows.push([
      esc(x.id),
      esc(x.name),
      esc(x.operator),
      esc(x.coverage),
      esc((x.sensor || []).join("|")),
      esc(x.access),
      esc(x.category),
      esc(x.updated),
      esc(x.url),
      esc(x.evidence_url),
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

function sortList(list, sortKey) {
  const byName = (a,b)=> (a.name||"").localeCompare(b.name||"");
  const byCov = (a,b)=> (a.coverage||"").localeCompare(b.coverage||"") || byName(a,b);
  const byCat = (a,b)=> (a.category||"").localeCompare(b.category||"") || byName(a,b);
  const byUpd = (a,b)=> {
    const da = toISODate(a.updated), db = toISODate(b.updated);
    // newest first; empty at bottom
    if (!da && !db) return byName(a,b);
    if (!da) return 1;
    if (!db) return -1;
    return db.localeCompare(da) || byName(a,b);
  };

  const fn = (sortKey === "name_asc") ? byName :
             (sortKey === "coverage_asc") ? byCov :
             (sortKey === "category_asc") ? byCat :
             byUpd;

  list.sort(fn);
  return list;
}

function badgesFor(src) {
  const b = [];
  // category badge
  if (src.category) b.push({ text: src.category, kind: "normal" });

  // access bucket badge
  const ab = accessBucket(src.access);
  if (ab === "public") b.push({ text: "public", kind: "good" });
  if (ab === "login") b.push({ text: "login", kind: "warn" });
  if (ab === "commercial") b.push({ text: "commercial", kind: "normal" });

  // https hint
  if (!isHttps(src.url)) b.push({ text: "non-https", kind: "warn" });

  // NEW/updated badge
  const d = daysSince(src.updated);
  if (d <= 30) b.push({ text: "updated<30d", kind: "new" });
  else if (d <= 90) b.push({ text: "updated<90d", kind: "new" });

  return b;
}

function render() {
  const listEl = document.getElementById("list");
  const statsEl = document.getElementById("stats");
  if (!listEl || !statsEl) return;

  const f = getFilters();
  let filtered = ALL.filter(x => match(x, f));
  filtered = sortList(filtered, f.sort);
  LAST_FILTERED = filtered;

  // stats summary
  const recent = getSpecialRecent();
  const recentText = recent ? ` · recent=${recent}d` : "";
  statsEl.textContent = `${filtered.length} / ${ALL.length} sources${recentText}`;

  listEl.innerHTML = "";

  filtered.forEach(src => {
    const title = `${src.name || "Unnamed"} (${src.coverage || "—"}, ${(src.sensor || []).join(", ") || "—"})`;
    const a = el("a", { class: "link", href: src.url, target: "_blank", rel: "noopener noreferrer" }, [title]);

    const badges = el("div", { class: "badges" });
    badgesFor(src).forEach(x => {
      const cls = x.kind === "good" ? "badge badgeGood" :
                  x.kind === "warn" ? "badge badgeWarn" :
                  x.kind === "new" ? "badge badgeNew" : "badge";
      badges.appendChild(el("span", { class: cls, text: x.text }));
    });

    const top = el("div", { class: "cardTop" }, [a, badges]);

    const metaParts = [];
    metaParts.push(src.operator ? `Operator: ${src.operator}` : "Operator: —");
    metaParts.push(src.access ? `Access: ${src.access}` : "Access: —");
    metaParts.push(src.updated ? `Updated: ${src.updated}` : "Updated: —");
    if (src.evidence_url) metaParts.push(`Evidence: ${src.evidence_url}`);

    const meta = el("div", { class: "meta", text: metaParts.join(" · ") });
    const note = el("div", { class: "note", text: src.notes || "" });

    listEl.appendChild(el("div", { class: "card" }, [top, meta, note]));
  });

  if (!filtered.length) {
    listEl.appendChild(el("div", { class: "empty" }, ["No sources match your filters."]));
  }
}

(async function main(){
  try {
    await loadSources();
    buildUI();

    // Priority: URL params > Local memory
    applyFiltersFromURL();
    applyFiltersLocalIfNoURL();

    // If recent was set previously via pills in URL, keep it; otherwise clear for clean state
    const r = getSpecialRecent();
    if (!r) clearSpecialRecent();

    render();
  } catch (e) {
    const mount = document.getElementById("app");
    mount.innerHTML = "";
    mount.appendChild(el("div", { class: "error" }, [`Failed to load sources. ${e.message}`]));
  }
})();
