async function loadData() {
  const res = await fetch("./satellites.json");
  return res.json();
}

function monthNum(m) {
  const [y, mo] = m.split("-").map(Number);
  return y * 12 + mo;
}

function filterByTime(groups, from, to) {
  const f = monthNum(from);
  const t = monthNum(to);

  return groups.map(group => ({
    ...group,
    satellites: group.satellites.map(s => {
      const since = monthNum(s.archive_since);
      return {
        ...s,
        archive_possible: since <= t
      };
    })
  }));
}

function render(groups) {
  const root = document.getElementById("results");
  root.innerHTML = "";

  groups.forEach(g => {
    const sec = document.createElement("section");
    sec.className = "group";

    sec.innerHTML = `
      <h2>${g.label}</h2>
      <p class="desc">${g.description}</p>
    `;

    g.satellites.forEach(s => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="title">${s.name}</div>
        <div class="meta">${s.operator} · ${s.commercial ? "Commercial" : "Public"} · ${s.type}</div>
        <div class="row">Archive: ${s.archive_possible ? "Possible" : "Not available"}</div>
        <div class="row">Revisit: ${s.revisit_days || "—"}</div>
        <a href="${s.query_url}" target="_blank">Official Information</a>
      `;

      sec.appendChild(card);
    });

    root.appendChild(sec);
  });
}

document.getElementById("run").onclick = async () => {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const data = await loadData();
  const filtered = filterByTime(data.groups, from, to);
  render(filtered);
};
