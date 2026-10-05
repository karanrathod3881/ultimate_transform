// Backup confirmation: set this URL as a webhook in the Razorpay Dashboard (events: payment.captured, order.paid).
const crypto = require("crypto"), db = require("./lib/db");
exports.handler = async (e) => {
  try {
    const sig = e.headers["x-razorpay-signature"] || "", mine = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(e.body || "").digest("hex");
    if (sig.length !== mine.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(mine))) return db.res(400, "Bad signature");
    const p = JSON.parse(e.body), pay = p.payload && p.payload.payment && p.payload.payment.entity;
    if (pay && pay.order_id && (p.event === "payment.captured" || p.event === "order.paid")) await db.rpc("confirm_booking", { p_order: pay.order_id, p_payment: pay.id });
    return db.res(200, { ok: true });
  } catch (err) { return db.res(500, "Server error"); }
};
