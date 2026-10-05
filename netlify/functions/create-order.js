// Creates the Razorpay order and a pending booking. Price and seats are checked on the server.
const db = require("./lib/db");
const code = () => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = ""; for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)]; return s; };
exports.handler = async (e) => {
  try {
    const b = JSON.parse(e.body || "{}"), n = Math.min(5, Math.max(1, parseInt(b.seats, 10) || 1));
    const name = String(b.name || "").trim().slice(0, 100), email = String(b.email || "").trim().slice(0, 120), phone = String(b.phone || "").trim();
    if (!b.eventId || !name || !/^\S+@\S+\.\S+$/.test(email) || !/^[6-9]\d{9}$/.test(phone)) return db.res(400, "Invalid details");
    const ev = (await db.get("/events?id=eq." + encodeURIComponent(b.eventId) + "&active=eq.true&select=*"))[0];
    if (!ev) return db.res(404, "Workshop not found");
    if (ev.seats_total - ev.seats_booked < n) return db.res(409, "Not enough seats");
    const amount = ev.price * n;
    if (amount < 1) return db.res(400, "Invalid price");
    const auth = Buffer.from(process.env.RAZORPAY_KEY_ID + ":" + process.env.RAZORPAY_KEY_SECRET).toString("base64");
    const ro = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: "Basic " + auth, "Content-Type": "application/json" }, body: JSON.stringify({ amount: amount * 100, currency: "INR", receipt: "ut_" + Date.now(), notes: { event: ev.id, seats: String(n) } }) });
    const o = await ro.json();
    if (!ro.ok) return db.res(502, "Payment gateway error");
    const ticket = "UT-" + new Date().toISOString().slice(2, 7).replace("-", "") + "-" + code();
    await db.post("/bookings", { event_id: ev.id, name, email, phone, seats: n, amount, status: "pending", razorpay_order_id: o.id, ticket_no: ticket }, "return=minimal");
    return db.res(200, { orderId: o.id, amount: o.amount });
  } catch (err) { return db.res(500, "Server error"); }
};
