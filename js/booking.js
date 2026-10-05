(function () {
  var S = window.RESOURCES.strings, C = window.SITE_CONFIG, d = document;
  function $(i) { return d.getElementById(i); }
  function el(t, c, x) { var e = d.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; }
  var live = !!(C.supabaseUrl && C.supabaseAnonKey), full = live && !!C.razorpayKeyId;
  var dlg = $("book"), form = $("bf"), sel = $("bs"), seats = $("bq"), msg = $("bmsg"), pay = $("bpay"), list = $("evl"), events = [], last = null;
  $("bdemo").hidden = full;
  var fmt = window.UT.fmt;
  function left(e) { return e.seats_total - e.seats_booked; }
  function sample() { return window.RESOURCES.demoEvents.map(function (e) { return Object.assign({}, e); }); }
  function load() {
    if (!live) { events = sample(); render(); return; }
    var today = new Date().toISOString().slice(0, 10);
    fetch(C.supabaseUrl + "/rest/v1/events?select=*&active=eq.true&event_date=gte." + today + "&order=event_date.asc", { headers: { apikey: C.supabaseAnonKey, Authorization: "Bearer " + C.supabaseAnonKey } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (e) { events = e; render(); })
      .catch(function () { list.textContent = ""; list.appendChild(el("li", "msgli", S["events.error"])); });
  }
  function render() {
    list.textContent = "";
    if (!events.length) { list.appendChild(el("li", "msgli", S["events.empty"])); return; }
    events.forEach(function (e) {
      var li = el("li"), b = el("div", "dbadge", fmt(e.event_date)); if (e.event_time) b.appendChild(el("small", "", e.event_time));
      var ev = el("div", "ev"); ev.appendChild(el("strong", "", e.title)); ev.appendChild(el("span", "meta", e.venue || "")); if (e.description) ev.appendChild(el("span", "meta", e.description));
      var pr = el("div", "price"), st = el("strong", "", S["currency.label"] + " " + e.price); pr.appendChild(st);
      pr.appendChild(el("span", "meta", S["event.price.label"] + " | " + (left(e) > 0 ? left(e) + " " + S["events.left"] : S["events.soldout"])));
      var btn = el("button", "btn small", left(e) > 0 ? S["events.cta"] : S["events.soldout"]); btn.type = "button"; btn.dataset.book = e.id; btn.disabled = left(e) <= 0;
      li.appendChild(b); li.appendChild(ev); li.appendChild(pr); li.appendChild(btn); list.appendChild(li);
    });
  }
  function cur() { return events.filter(function (e) { return String(e.id) === sel.value; })[0]; }
  function count() { return Math.max(1, Math.min(5, Math.floor(+seats.value) || 1)); }
  function upd() { var e = cur(); $("btot").textContent = e ? e.price * count() : 0; }
  sel.onchange = seats.oninput = upd;
  d.addEventListener("click", function (e) {
    var b = e.target.closest("[data-book]");
    if (b && !b.disabled) { openBook(b.dataset.book); return; }
    if (e.target.closest("[data-close]")) dlg.close();
  });
  function openBook(id) {
    var avail = events.filter(function (e) { return left(e) > 0; });
    sel.textContent = "";
    avail.forEach(function (e) { var o = el("option", "", e.title + " - " + fmt(e.event_date) + " (" + S["currency.label"] + " " + e.price + ")"); o.value = e.id; sel.appendChild(o); });
    if (!avail.length) { return; }
    if (id) sel.value = id;
    form.hidden = false; $("bok").hidden = true; msg.textContent = ""; pay.disabled = false; upd(); dlg.showModal();
  }
  var mt = $("mt"), nv = $("nv");
  mt.addEventListener("click", function () { var o = nv.classList.toggle("open"); mt.setAttribute("aria-expanded", o); });
  nv.addEventListener("click", function () { nv.classList.remove("open"); mt.setAttribute("aria-expanded", "false"); });

  function post(url, body) {
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error("http"); return r.json(); });
  }
  function script(src) {
    return new Promise(function (ok, bad) { if (window.Razorpay) return ok(); var s = el("script"); s.src = src; s.onload = ok; s.onerror = bad; d.head.appendChild(s); });
  }
  function fail(m) { pay.disabled = false; msg.textContent = typeof m === "string" ? m : S["book.err.fail"]; }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var e = cur(), n = count(), c = { name: $("bn").value.trim(), email: $("be").value.trim(), phone: $("bp").value.trim() };
    pay.disabled = true; msg.textContent = S["book.processing"];
    if (!full) {
      done({ ticket_no: "UT-DEMO-" + Math.random().toString(36).slice(2, 8).toUpperCase(), name: c.name, email: c.email, phone: c.phone, seats: n, amount: e.price * n, razorpay_payment_id: "pay_DEMO" + Math.random().toString(36).slice(2, 10).toUpperCase(), paid_at: new Date().toISOString(), event: e });
      return;
    }
    post(C.apiBase + "/create-order", { eventId: e.id, seats: n, name: c.name, email: c.email, phone: c.phone }).then(function (o) {
      return script("https://checkout.razorpay.com/v1/checkout.js").then(function () {
        var rz = new window.Razorpay({
          key: C.razorpayKeyId, amount: o.amount, currency: "INR", order_id: o.orderId, name: S["brand.name"], description: e.title,
          prefill: { name: c.name, email: c.email, contact: c.phone }, theme: { color: "#5b2a9e" },
          handler: function (resp) { post(C.apiBase + "/verify-payment", resp).then(done).catch(function () { fail(S["book.err.verify"]); }); },
          modal: { ondismiss: function () { pay.disabled = false; msg.textContent = ""; } }
        });
        rz.on("payment.failed", function () { fail(); }); rz.open();
      });
    }).catch(function () { fail(S["book.err.server"]); });
  });
  function done(b) {
    b.event = b.event || b.events; last = b; $("btk").textContent = b.ticket_no;
    try { window.UT.makePdf(b); } catch (x) { /* PDF library missing */ }
    form.hidden = true; $("bok").hidden = false; load();
  }
  $("bdl").addEventListener("click", function () { window.UT.makePdf(last); });
  $("bcal").addEventListener("click", function () { window.UT.ics(last); });

  load();
})();
