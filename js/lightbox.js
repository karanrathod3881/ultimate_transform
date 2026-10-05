(function () {
  var I = window.RESOURCES.images, d = document, dlg = d.getElementById("lb"), img = d.getElementById("lbi"), cap = d.getElementById("lbc"), n = 0, idx = 0;
  if (!dlg) return;
  while (I["gallery." + n]) n++;
  function show(i) { idx = (i + n) % n; var g = I["gallery." + idx]; img.src = g.full; img.alt = g.alt; cap.textContent = g.alt + " (" + (idx + 1) + "/" + n + ")"; }
  d.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lb]");
    if (b) { show(+b.dataset.lb); dlg.showModal(); return; }
    if (e.target.closest("[data-lbnext]")) show(idx + 1);
    else if (e.target.closest("[data-lbprev]")) show(idx - 1);
    else if (e.target.closest("[data-lbclose]") || e.target === dlg) dlg.close();
  });
  d.addEventListener("keydown", function (e) { if (!dlg.open) return; if (e.key === "ArrowRight") show(idx + 1); if (e.key === "ArrowLeft") show(idx - 1); });
})();
