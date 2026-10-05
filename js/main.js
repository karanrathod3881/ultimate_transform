(function () {
  var S = window.RESOURCES.strings, I = window.RESOURCES.images, d = document;
  function each(sel, fn) { Array.prototype.forEach.call(d.querySelectorAll(sel), fn); }
  each("[data-text]", function (e) { e.textContent = S[e.dataset.text]; });
  each("[data-content]", function (e) { e.setAttribute("content", S[e.dataset.content]); });
  each("[data-aria]", function (e) { e.setAttribute("aria-label", S[e.dataset.aria]); });
  each("[data-placeholder]", function (e) { e.setAttribute("placeholder", S[e.dataset.placeholder]); });
  each("[data-image]", function (e) {
    var i = I[e.dataset.image]; e.src = i.src; e.alt = i.alt; e.width = i.width; e.height = i.height;
  });
  var y = d.getElementById("yr"); if (y) y.textContent = new Date().getFullYear();
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    each(".card,.gal li,.ct>div,blockquote", function (e, i) { e.classList.add("rv"); e.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(e); });
  }
})();
