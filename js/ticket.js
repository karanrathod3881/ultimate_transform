/* Shared by the booking page and the admin panel: builds the ticket + receipt PDF and the calendar file. */
(function () {
  var S = window.RESOURCES.strings;
  function fmt(s) { return new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
  function download(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); }
  function makePdf(b) {
    var p = new window.jspdf.jsPDF({ unit: "mm", format: "a4" }), ev = b.event, when = fmt(ev.event_date) + (ev.event_time ? ", " + ev.event_time : "");
    function mid(t, y, size, rgb) { p.setFontSize(size); p.setTextColor(rgb[0], rgb[1], rgb[2]); p.text(t, 105, y, { align: "center" }); }
    p.setFillColor(20, 10, 61); p.rect(0, 0, 210, 297, "F"); p.setDrawColor(245, 197, 66); p.setLineWidth(0.8); p.rect(8, 8, 194, 281);
    mid(S["brand.name"].toUpperCase(), 34, 26, [245, 197, 66]); mid(S["brand.sub"], 43, 12, [255, 255, 255]); mid(S["ticket.title"], 62, 16, [207, 195, 238]);
    p.setFontSize(19); p.setTextColor(245, 197, 66); p.text(p.splitTextToSize(ev.title, 160), 105, 80, { align: "center" });
    var y = 106;
    [[S["ticket.when"], when], [S["ticket.venue"], ev.venue || "-"], [S["ticket.name"], b.name], [S["ticket.seats"], String(b.seats)], [S["ticket.no"], b.ticket_no]].forEach(function (r) {
      p.setFontSize(10); p.setTextColor(207, 195, 238); p.text(r[0], 30, y); p.setFontSize(13); p.setTextColor(255, 255, 255); p.text(p.splitTextToSize(String(r[1]), 110), 80, y); y += 13;
    });
    var q = window.qrcode(0, "M"); q.addData(b.ticket_no); q.make();
    var n = q.getModuleCount(), size = 64, cell = size / n, x0 = 105 - size / 2, y0 = 182;
    p.setFillColor(255, 255, 255); p.rect(x0 - 6, y0 - 6, size + 12, size + 12, "F"); p.setFillColor(20, 10, 61);
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) p.rect(x0 + c * cell, y0 + r * cell, cell + 0.08, cell + 0.08, "F");
    mid(S["ticket.scan"], 266, 11, [207, 195, 238]); mid(S["tagline"], 278, 10, [245, 197, 66]);
    p.addPage(); p.setFillColor(91, 42, 158); p.rect(0, 0, 210, 36, "F"); p.setTextColor(255, 255, 255); p.setFontSize(20); p.text(S["brand.name"], 15, 17); p.setFontSize(12); p.text(S["receipt.title"], 15, 28);
    y = 54;
    function row(l, v, big) { p.setFontSize(10); p.setTextColor(110, 110, 110); p.text(l, 15, y); p.setFontSize(big ? 16 : 12); p.setTextColor(big ? 91 : 30, big ? 42 : 30, big ? 158 : 30); p.text(p.splitTextToSize(String(v), 120), 70, y); y += big ? 12 : 10; }
    function line() { p.setDrawColor(210, 210, 210); p.setLineWidth(0.2); p.line(15, y - 5, 195, y - 5); y += 4; }
    row(S["receipt.no"], "RC-" + b.ticket_no); row(S["receipt.date"], new Date(b.paid_at).toLocaleString("en-IN")); row(S["receipt.paymentid"], b.razorpay_payment_id); line();
    row(S["receipt.billed"], b.name); row("", b.email); row("", b.phone); line();
    row(S["receipt.event"], ev.title); row(S["receipt.when"], when + ", " + (ev.venue || "")); row(S["receipt.seats"], b.seats); row(S["receipt.rate"], S["currency.label"] + " " + (b.amount / b.seats)); line();
    row(S["receipt.amount"], S["currency.label"] + " " + b.amount, true); row(S["receipt.status"], S["receipt.paid"]);
    p.setFontSize(11); p.setTextColor(60, 60, 60); p.text(S["receipt.thanks"], 15, y + 20); p.setFontSize(9); p.setTextColor(130, 130, 130); p.text(S["receipt.note"], 15, y + 27);
    p.save("ticket-" + b.ticket_no + ".pdf");
  }
  function ics(b) {
    var e = b.event, nx = new Date(e.event_date + "T00:00:00"); nx.setDate(nx.getDate() + 1);
    var d1 = nx.getFullYear() + ("0" + (nx.getMonth() + 1)).slice(-2) + ("0" + nx.getDate()).slice(-2);
    function esc(t) { return String(t || "").replace(/[\\;,]/g, "\\$&").replace(/\n/g, "\\n"); }
    var txt = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ultimate Transform//EN", "BEGIN:VEVENT", "UID:" + b.ticket_no + "@ultimatetransform",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z", "DTSTART;VALUE=DATE:" + e.event_date.replace(/-/g, ""), "DTEND;VALUE=DATE:" + d1,
      "SUMMARY:" + esc(e.title), "LOCATION:" + esc(e.venue), "DESCRIPTION:" + esc(S["ticket.no"] + " " + b.ticket_no + (e.event_time ? " | " + e.event_time : "")), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    download(new Blob([txt], { type: "text/calendar" }), "workshop.ics");
  }
  window.UT = { fmt: fmt, makePdf: makePdf, ics: ics };
})();
