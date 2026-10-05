// Verifies the Razorpay signature, confirms the booking and returns the data for the ticket and receipt.
const crypto = require("crypto"), db = require("./lib/db");
exports.handler = async (e) => {
  try {
    const b = JSON.parse(e.body || "{}");
    const sig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(b.razorpay_order_id + "|" + b.razorpay_payment_id).digest("hex");
    const ok = typeof b.razorpay_signature === "string" && sig.length === b.razorpay_signature.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(b.razorpay_signature));
    if (!ok) return db.res(400, "Signature mismatch");
    await db.rpc("confirm_booking", { p_order: b.razorpay_order_id, p_payment: b.razorpay_payment_id });
    const r = await db.get("/bookings?razorpay_order_id=eq." + encodeURIComponent(b.razorpay_order_id) + "&select=ticket_no,name,email,phone,seats,amount,razorpay_payment_id,paid_at,events(title,event_date,event_time,venue)");
    return db.res(200, r[0]);
  } catch (err) { return db.res(500, "Server error"); }
};
