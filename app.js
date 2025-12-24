const $ = (id) => document.getElementById(id);

function toast(msg, ms=1800){
  const t = $("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toast._tm);
  toast._tm = setTimeout(()=>t.classList.add("hidden"), ms);
}

/* ===== Design-only interactions ===== */
function setStatus(msg){
  const el = $("aoiStatus");
  if(el) el.textContent = msg;
}

document.querySelectorAll(".tab").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    toast(`Switched to ${btn.textContent}`, 1200);
  });
});

/* Buttons (no map yet) */
$("btnDraw")?.addEventListener("click", ()=>{
  setStatus("AOI (design mode) · ready");
  toast("Design mode: AOI tools will be added later.", 1800);
});

$("btnClearAOI")?.addEventListener("click", ()=>{
  setStatus("AOI not set");
  toast("Cleared (design mode).", 1200);
});

$("btnGeocode")?.addEventListener("click", ()=>{
  toast("Design mode: geocoding will be added later.", 1600);
});

$("btnPointRadius")?.addEventListener("click", ()=>{
  toast("Design mode: click-to-pick will be added later.", 1600);
});

$("btnQuery")?.addEventListener("click", ()=>{
  toast("Design mode: STAC query will be added later.", 1600);
});

$("btnClearResults")?.addEventListener("click", ()=>{
  $("results") && ($("results").innerHTML = "");
  $("countPill") && ($("countPill").textContent = "0");
  toast("Results cleared.", 1200);
});

/* Timeline label */
function updateTimeLabel(){
  const v = Number($("timeSlider")?.value ?? 100);
  const maxAgeDays = 365 * 10;
  const days = maxAgeDays * (v / 100);
  const t = Date.now() - days * 86400000;
  const d = new Date(t);
  $("timeLabel") && ($("timeLabel").textContent = (v === 100) ? "Now" : d.toISOString().slice(0,10));
}
$("timeSlider")?.addEventListener("input", updateTimeLabel);
updateTimeLabel();
