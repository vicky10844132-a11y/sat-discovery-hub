async function loadSources() {
  const res = await fetch("./public/sources.default.json");
  const sources = await res.json();

  const container = document.createElement("div");
  container.style.marginTop = "40px";

  const title = document.createElement("h2");
  title.textContent = "Available Public Satellite Discovery Sources";
  container.appendChild(title);

  sources.forEach(src => {
    const item = document.createElement("div");
    item.style.marginBottom = "16px";

    const link = document.createElement("a");
    link.href = src.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${src.name} (${src.coverage}, ${src.sensor.join(", ")})`;

    const note = document.createElement("div");
    note.style.fontSize = "13px";
    note.style.opacity = "0.8";
    note.textContent = src.notes;

    item.appendChild(link);
    item.appendChild(note);
    container.appendChild(item);
  });

  document.body.appendChild(container);
}

loadSources();
