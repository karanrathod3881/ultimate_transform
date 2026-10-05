(function () {
  var S = window.RESOURCES.strings, C = window.SITE_CONFIG, d = document;
  function $(i) { return d.getElementById(i); }
  function el(t, c, x) { var e = d.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; }
  if (!C.supabaseUrl || !C.supabaseAnonKey) { $("cfg").hidden = false; return; }
  var tok = sessionStorage.getItem("ut_tok"), events = [], books = [];
  function api(path, o) {
    o = o || {}; o.headers = Object.assign({ apikey: C.supabaseAnonKey, Authorization: "Bearer " + (tok || C.supabaseAnonKey), "Content-Type": "application/json" }, o.headers);
    return fetch(C.supabaseUrl + path, o).then(function (r) {
      if (r.status === 401) { signout(); throw new Error("401"); }
      if (!r.ok) return r.text().then(function (t) { throw new Error(t); });
      return r.text().then(function (t) { return t ? JSON.parse(t) : null; });
    });
  }
  function show(on) { $("login").hidden = on; $("app").hidden = !on; $("out").hidden = !on; }
  function signout() { tok = null; sessionStorage.removeItem("ut_tok"); show(false); }
  $("out").onclick = signout;
  $("lf").onsubmit = function (e) {
    e.preventDefault(); $("lmsg").textContent = "";
    fetch(C.supabaseUrl + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: C.supabaseAnonKey, "Content-Type": "application/json" }, body: JSON.stringify({ email: $("ae").value, password: $("ap").value }) })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { tok = j.access_token; return api("/rest/v1/admins?select=user_id"); })
      .then(function (rows) { if (!rows.length) { tok = null; $("lmsg").textContent = S["admin.denied"]; return; } sessionStorage.setItem("ut_tok", tok); start(); })
      .catch(function () { $("lmsg").textContent = S["admin.badlogin"]; });
  };
  function fmt(s) { return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  function yn(v) { return v ? S["admin.yes"] : S["admin.no"]; }
  function table(t, heads, rows) {
    t.textContent = ""; var h = el("tr"); heads.forEach(function (k) { h.appendChild(el("th", "", S[k])); }); t.appendChild(el("thead")).appendChild(h);
    var tb = el("tbody"); t.appendChild(tb);
    if (!rows.length) { var r0 = el("tr"), c0 = el("td", "", S["admin.empty"]); c0.colSpan = heads.length; r0.appendChild(c0); tb.appendChild(r0); }
    rows.forEach(function (r) { var tr = el("tr"); r.forEach(function (c) { var td = el("td"); if (c && c.nodeType) td.appendChild(c); else td.textContent = c; tr.appendChild(td); }); tb.appendChild(tr); });
  }
  function btn(label, fn) { var b = el("button", "btn small ghost", label); b.type = "button"; b.onclick = fn; return b; }
  function statusOpts() { var s = $("bst"); if (s.options.length) return; [["", "admin.status.all"], ["paid", "admin.status.paid"], ["pending", "admin.status.pending"]].forEach(function (x) { var o = el("option", "", S[x[1]]); o.value = x[0]; s.appendChild(o); }); }
  function start() { show(true); statusOpts(); load(); }
  function load() {
    return Promise.all([api("/rest/v1/events?select=*&order=event_date.desc"), api("/rest/v1/bookings?select=*,events(title,event_date,event_time,venue)&order=created_at.desc&limit=2000")]).then(function (r) { events = r[0]; books = r[1]; stats(); evTable(); filters(); bkTable(); });
  }
  d.querySelectorAll("[data-tab]").forEach(function (b) {
    b.onclick = function () {
      d.querySelectorAll("[data-tab]").forEach(function (x) { x.classList.toggle("on", x === b); });
      ["ov", "ev", "bk", "ck"].forEach(function (k) { $("t-" + k).hidden = k !== b.dataset.tab; });
    };
  });
  d.querySelector("[data-tab=ov]").classList.add("on");
  function stats() {
    var paid = books.filter(function (b) { return b.status === "paid"; }), rev = 0, seats = 0;
    paid.forEach(function (b) { rev += b.amount; seats += b.seats; });
    var open = events.filter(function (e) { return e.active; }).length, st = $("st"); st.textContent = "";
    [["admin.stat.revenue", S["currency.label"] + " " + rev], ["admin.stat.bookings", paid.length], ["admin.stat.seats", seats], ["admin.stat.upcoming", open]].forEach(function (x) {
      var li = el("li"); li.appendChild(el("b", "", String(x[1]))); li.appendChild(el("span", "", S[x[0]])); st.appendChild(li);
    });
  }
  function evTable() {
    table($("etab"), ["admin.col.date", "admin.f.title", "admin.col.price", "admin.col.booked", "admin.col.open", "admin.col.actions"], events.map(function (e) {
      var a = el("div");
      a.appendChild(btn(S["admin.edit"], function () { fill(e); }));
      a.appendChild(btn(S["admin.toggle"], function () { api("/rest/v1/events?id=eq." + e.id, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ active: !e.active }) }).then(load); }));
      a.appendChild(btn(S["admin.delete"], function () { if (confirm(S["admin.confirmdel"])) api("/rest/v1/events?id=eq." + e.id, { method: "DELETE" }).then(load).catch(function () { $("emsg").textContent = S["admin.err"]; }); }));
      return [fmt(e.event_date) + (e.event_time ? " " + e.event_time : ""), e.title, S["currency.label"] + " " + e.price, e.seats_booked + " / " + e.seats_total, yn(e.active), a];
    }));
  }
  function fill(e) {
    $("e-id").value = e.id; $("e-title").value = e.title; $("e-date").value = e.event_date; $("e-time").value = e.event_time || ""; $("e-venue").value = e.venue || "";
    $("e-price").value = e.price; $("e-seats").value = e.seats_total; $("e-desc").value = e.description || ""; $("e-active").checked = e.active; $("ef").scrollIntoView();
  }
  function clear() { $("ef").reset(); $("e-id").value = ""; $("e-active").checked = true; }
  $("e-clear").onclick = function () { clear(); $("emsg").textContent = ""; };
  $("ef").onsubmit = function (ev) {
    ev.preventDefault(); var id = $("e-id").value;
    var p = { title: $("e-title").value.trim(), description: $("e-desc").value.trim(), event_date: $("e-date").value, event_time: $("e-time").value.trim(), venue: $("e-venue").value.trim(), price: parseInt($("e-price").value, 10), seats_total: parseInt($("e-seats").value, 10), active: $("e-active").checked };
    api(id ? "/rest/v1/events?id=eq." + id : "/rest/v1/events", { method: id ? "PATCH" : "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(p) })
      .then(function () { $("emsg").textContent = S["admin.saved"]; clear(); return load(); }).catch(function () { $("emsg").textContent = S["admin.err"]; });
  };
  function filters() {
    var f = $("bflt"), v = f.value; f.textContent = ""; var o = el("option", "", S["admin.filter.all"]); o.value = ""; f.appendChild(o);
    events.forEach(function (e) { var x = el("option", "", e.title + " - " + fmt(e.event_date)); x.value = e.id; f.appendChild(x); }); f.value = v;
  }
  function visible() {
    var f = $("bflt").value, st = $("bst").value, q = $("bsr").value.trim().toLowerCase();
    return books.filter(function (b) { return (!f || b.event_id === f) && (!st || b.status === st) && (!q || (b.name + " " + b.phone + " " + b.ticket_no + " " + b.email).toLowerCase().indexOf(q) > -1); });
  }
  function checkin(b) { return api("/rest/v1/bookings?id=eq." + b.id, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ checked_in: true }) }).then(load); }
  function bkTable() {
    table($("btab"), ["admin.col.ticket", "admin.col.name", "admin.col.phone", "admin.col.email", "admin.col.event", "admin.col.seats", "admin.col.amount", "admin.col.status", "admin.col.checkin", "admin.col.actions"], visible().map(function (b) {
      var ci = b.status === "paid" && !b.checked_in ? btn(S["admin.checkin"], function () { checkin(b); }) : yn(b.checked_in);
      return [b.ticket_no, b.name, b.phone, b.email, b.events ? b.events.title : "", b.seats, S["currency.label"] + " " + b.amount, b.status, ci, b.status === "paid" ? btn(S["admin.pdf"], function () { window.UT.makePdf({ ticket_no: b.ticket_no, name: b.name, email: b.email, phone: b.phone, seats: b.seats, amount: b.amount, razorpay_payment_id: b.razorpay_payment_id, paid_at: b.paid_at, event: b.events }); }) : ""];
    }));
  }
  $("bflt").onchange = $("bst").onchange = $("bsr").oninput = bkTable;
  $("bx").onclick = function () {
    var rows = [["ticket_no", "name", "phone", "email", "workshop", "seats", "amount", "status", "paid_at", "checked_in"]].concat(visible().map(function (b) { return [b.ticket_no, b.name, b.phone, b.email, b.events ? b.events.title : "", b.seats, b.amount, b.status, b.paid_at || "", b.checked_in]; }));
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
    var a = el("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "bookings.csv"; a.click();
  };
  $("cf").onsubmit = function (e) {
    e.preventDefault(); var box = $("cr"), t = $("ct").value.trim().toUpperCase(); box.textContent = "";
    var b = books.filter(function (x) { return x.ticket_no === t; })[0];
    if (!b) { box.appendChild(el("p", "msg", S["admin.notfound"])); return; }
    box.appendChild(el("h3", "", b.ticket_no)); box.appendChild(el("p", "", b.name + " | " + b.phone + " | " + b.seats + " | " + (b.events ? b.events.title : "")));
    if (b.status !== "paid") { box.appendChild(el("p", "msg", S["admin.unpaid"])); return; }
    if (b.checked_in) { box.appendChild(el("p", "msg", S["admin.already"])); return; }
    var c = el("button", "btn", S["admin.checkin"]); c.type = "button"; c.onclick = function () { checkin(b).then(function () { box.textContent = S["admin.checkedin"]; }); }; box.appendChild(c);
  };
  if (tok) api("/rest/v1/admins?select=user_id").then(function (r) { if (r.length) start(); else signout(); }).catch(function () { show(false); }); else show(false);
})();
