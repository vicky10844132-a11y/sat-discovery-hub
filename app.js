let ALL = [];

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const c of children) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  return node;
}

function norm(s) {
  return (s || "").toString().toLowerCase().trim();
}

function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}

async function loadSources() {
  const res = await fetch("./sources.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load sources.json (${res.status})`);
  ALL = await res.json();
  initUI();
  render();
}

function initUI() {
  // --- Mount container ---
  const wrap = el("div", { class: "hub-wrap" });

  // --- Controls ---
  const controls = el("div", { class: "hub-controls" });

  const q = el("input", {
    class: "hub-input",
    type: "search",
    placeholder: "Search name / operator / notes…",
    id: "q"
  });

  // Sensor filters
  const sensorGroup = el("div", { class: "hub-group" }, [
    el("div", { class: "hub-label" }, ["Sensor"])
  ]);

  const sensors = [
    { id: "f_optical", label: "Optical", value: "optical" },
    { id: "f_sar", label: "SAR", value: "sar" },
    { id: "f_video", label: "Video", value: "video" }
  ];

  sensors.forEach(s => {
    sensorGroup.appendChild(
      el("label", { class: "hub-chip" }, [
        el("input", { type: "checkbox", id: s.id, value: s.value }),
        el("span", {}, [s.label])
      ])
    );
  });

  // Coverage dropdown (based on present values)
  const covSelect = el("select", { class: "hub-select", id: "coverage" });
  covSelect.appendChild(el("option", { value: "" }, ["All coverage"]));

  const covValues = uniq(ALL.map(x => x.coverage));
  covValues.sort().forEach(c => covSelect.appendChild(el("option", { value: c }, [c])));

  const covGroup = el("div", { class: "hub-group" }, [
    el("div", { class: "hub-label" }, ["Coverage"]),
    covSelect
  ]);

  // Access dropdown (normalize to buckets)
  const accessSelect = el("select", { class: "hub-select", id: "access" });
  accessSelect.appendChild(el("option", { value: "" }, ["All access"]));
  accessSelect.appendChild(el("option", { value: "public" }, ["Public / Open"]));
  accessSelect.appendChild(el("option", { value: "login" }, ["Login required"]));
  accessSelect.appendChild(el("option", { value: "commercial" }, ["Commercial"]));

  const accessGroup = el("div", { class: "hub-group" }, [
    el("div", { class: "hub-label" }, ["Access"]),
    accessSelect
  ]);

  // Reset button
  const resetBtn = el("button", { class: "hub-btn", id: "reset" }, ["Reset"]);

  // Stats
  const stats = el("div", { class: "hub-stats", id: "stats" }, ["—"]);

  controls.appendChild(q);
  controls.appendChild(sensorGroup);
  controls.appendChild(covGroup);
  controls.appendChild(accessGroup);
  controls.appendChild(resetBtn);
  controls.appendChild(stats);

  // --- List container ---
  const listTitle = el("h2", { class: "hub-h2" }, ["Available Public Satellite Discovery Sources"]);
  const list = el("div", { class: "hub-list", id: "list" });

  wrap.appendChild(listTitle);
  wrap.appendChild(controls);
  wrap.appendChild(list);

  document.body.appendChild(wrap);

  // --- Events ---
  const rerender = () => render();
  q.addEventListener("input", rerender);
  sensors.forEach(s => document.getElementById(s.id).addEventListener("change", rerender));
  covSelect.addEventListener("change", rerender);
  accessSelect.addEventListener("change", rerender);

  resetBtn.addEventListener("click", () => {
    q.value = "";
    sensors.forEach(s => (document.getElementById(s.id).checked = false));
    covSelect.value = "";
    accessSelect.value = "";
    render();
  });
}

function accessBucket(accessText) {
  const a = norm(accessText);
  if (!a) return "";
  if (a.includes("public") || a.includes("open")) return "public";
  if (a.includes("login") || a.includes("account")) return "login";
  if (a.includes("commercial")) return "commercial";
  return ""; // unknown
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

  // coverage exact match
  if (f.cov && (item.coverage || "") !== f.cov) return false;

  // access bucket match
  if (f.access) {
    const b = accessBucket(item.access);
    if (b !== f.access) return false;
  }

  // sensor: if any checked, item must contain at least one
  if (f.sensorWanted.length) {
    const s = (item.sensor || []).map(norm);
    const ok = f.sensorWanted.some(w => s.includes(w));
    if (!ok) return false;
  }

  return true;
}

function render() {
  const list = document.getElementById("list");
  const stats = document.getElementById("stats");
  if (!list || !stats) return;

  const f = getFilters();
  const filtered = ALL.filter(x => match(x, f));

  // Sort: coverage then name
  filtered.sort((a, b) => {
    const ca = (a.coverage || "").localeCompare(b.coverage || "");
    if (ca !== 0) return ca;
    return (a.name || "").localeCompare(b.name || "");
  });

  stats.textContent = `${filtered.length} / ${ALL.length} sources`;

  list.innerHTML = "";
  filtered.forEach(src => {
    const title = `${src.name || "Unnamed"} (${src.coverage || "—"}, ${(src.sensor || []).join(", ") || "—"})`;

    const a = el("a", {
      href: src.url,
      target: "_blank",
      rel: "noopener noreferrer",
      class: "hub-link"
    }, [title]);

    const meta = el("div", { class: "hub-meta" }, [
      src.operator ? `Operator: ${src.operator}` : "Operator: —",
      " · ",
      src.access ? `Access: ${src.access}` : "Access: —"
    ]);

    const note = el("div", { class: "hub-note" }, [src.notes || ""]);

    const card = el("div", { class: "hub-card" }, [a, meta, note]);
    list.appendChild(card);
  });

  if (!filtered.length) {
    list.appendChild(el("div", { class: "hub-empty" }, ["No sources match your filters."]));
  }
}

loadSources().catch(err => {
  const msg = el("div", { class: "hub-error" }, [
    "Failed to load sources. ",
    err.message
  ]);
  document.body.appendChild(msg);
});
