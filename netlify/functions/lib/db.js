const base = () => process.env.SUPABASE_URL + "/rest/v1";
const hdr = () => ({ apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: "Bearer " + process.env.SUPABASE_SERVICE_KEY, "Content-Type": "application/json" });
exports.get = async (p) => { const r = await fetch(base() + p, { headers: hdr() }); if (!r.ok) throw new Error(await r.text()); return r.json(); };
exports.post = async (p, b, prefer) => { const r = await fetch(base() + p, { method: "POST", headers: { ...hdr(), Prefer: prefer || "return=representation" }, body: JSON.stringify(b) }); if (!r.ok) throw new Error(await r.text()); return prefer === "return=minimal" ? null : r.json(); };
exports.rpc = (fn, args) => exports.post("/rpc/" + fn, args);
exports.res = (s, b) => ({ statusCode: s, headers: { "Content-Type": "application/json" }, body: JSON.stringify(typeof b === "string" ? { error: b } : b) });
