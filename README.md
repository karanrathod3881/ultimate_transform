# Ultimate Transform - Kundalini Yoga Foundation website

A fast, mobile-friendly website with workshop booking, Razorpay payments, a downloadable ticket (with QR code) and payment receipt PDF, and an admin panel.

- Public site: `index.html`
- Admin panel: `admin.html` (login with Supabase)
- No build step. Plain HTML, CSS and JavaScript, plus 4 small serverless functions for payments.

## 1. Quick start (demo mode, 1 minute)

Demo mode needs nothing but a browser. It shows 3 sample workshops, simulates the payment (no money, nothing saved) and still downloads a real ticket and receipt PDF.

```bash
# in this folder - pick ONE
python3 -m http.server 8000      # then open http://localhost:8000
npm start                        # needs Node 18+, then open http://localhost:5173
```

Tip: use a local server (above) instead of double-clicking `index.html`; browsers block some features on `file://`.

## 2. Full local test (real database + Razorpay test payments)

You need: Node.js 18+, a free [Supabase](https://supabase.com) project, a free [Razorpay](https://razorpay.com) account (Test Mode).

1. **Supabase**: SQL Editor > New query > paste `supabase/schema.sql` > Run.
2. **Admin user**: Authentication > Users > Add user (email + password). Then run in the SQL Editor:
   `insert into admins (user_id) select id from auth.users where email = 'you@example.com';`
3. **config.js**: fill `supabaseUrl`, `supabaseAnonKey` (Project Settings > API, the `anon public` key) and `razorpayKeyId` (`rzp_test_...`). These three are public by design.
4. **Secrets**: copy `.env.example` to `.env` and fill it (service role key, Razorpay Key Secret, webhook secret). Never commit `.env`.
5. **Run**: `npm run dev` (Netlify CLI) and open http://localhost:8888. Functions are served at `/.netlify/functions/...`.
6. Add a workshop in `http://localhost:8888/admin.html`, book it on the public page with a Razorpay test card/UPI, and check the booking appears in the admin panel.

The Razorpay webhook is only a backup confirmation; skip it locally (or expose the site with `netlify dev --live`).

## 3. Deploy (free)

Netlify is the easiest because the payment functions run there.
1. Push this folder to GitHub, then Netlify > Add new site > Import an existing project. `netlify.toml` is already set up.
2. Site settings > Environment variables: add the 5 values from `.env.example`.
3. Razorpay Dashboard > Webhooks: `https://YOUR-SITE/.netlify/functions/razorpay-webhook` (events `payment.captured`, `order.paid`).
4. Deploy, test with Razorpay Test Mode, then switch to Live keys (complete KYC first) and update `razorpayKeyId` and the Netlify secrets.

Full step-by-step with screenshots-free instructions and other hosts: see `HOSTING-GUIDE.md`.

## 4. Admin panel (`/admin.html`)

- **Overview**: revenue, paid bookings, seats sold, open workshops.
- **Workshops**: add, edit, open/close, delete (a workshop that has bookings can only be closed).
- **Bookings**: search, filter by workshop/status, export CSV, check in, re-download a guest's ticket PDF.
- **Check-in**: type the ticket number printed under the QR code.

## 5. Changing content

All text and image paths live in **`resources.js`**. Photos are in `assets/images/` (`-t.jpg` = thumbnail, plain = large version used in the gallery lightbox).

1. Edit `resources.js` (for example the contact details, the guide name and text, demo workshops).
2. Run `python3 tools/bake.py` (or `npm run bake`) so search engines and link previews see the new text. The browser already updates itself from `resources.js`.
3. Replace placeholders listed in `REPLACE-ME.md` (anything starting with `sample.`).

Swap or remove gallery photos: edit the `gallery.N` entries in `resources.js` and the list of `data-lb` buttons in `index.html` (one per photo, numbered from 0). Several supplied photos have a green-screen background; you may prefer to drop them.

## 6. Files

```
index.html  admin.html  404.html     pages
config.js                            public settings (Supabase URL/anon key, Razorpay key id)
resources.js                         all text, images paths, demo workshops
css/style.css   js/*.js              styles and scripts (js/vendor = jsPDF, qrcode)
netlify/functions/                   create-order, verify-payment, razorpay-webhook
supabase/schema.sql                  database tables, security rules, helper function
tools/bake.py                        pre-fills text into the HTML pages
netlify.toml  _headers  robots.txt   hosting settings
```

## 7. Troubleshooting

| Problem | Fix |
| --- | --- |
| Workshops show "could not be loaded" | Check `supabaseUrl` / `supabaseAnonKey` in `config.js`; run `supabase/schema.sql`; make sure at least one workshop is active and in the future. |
| "Could not start the payment" | Functions not running (use `npm run dev` or deploy to Netlify) or a missing/wrong environment variable. |
| "Not an administrator" at login | Run the `insert into admins ...` statement from step 2 with your email. |
| Payment succeeded but no ticket | Check the booking in Admin > Bookings (status Paid) and use "Ticket PDF". Confirm the webhook secret and Razorpay keys. |
| Admin page says to connect Supabase | `config.js` is empty (demo mode). |
| Razorpay rejects the order | Price must be at least INR 1. Make sure test keys are used with Test Mode. |

## 8. Security notes

- Never put the Razorpay Key Secret or the Supabase service role key in any file inside the site; only in `.env` / Netlify variables.
- Prices and seat limits are enforced on the server; payment signatures are verified before a booking is marked paid.
- The anon key is safe to publish because database rules (Row Level Security) only let admins read bookings.
- Use a strong admin password and turn on email confirmations / MFA in Supabase if you wish.

## 9. Known limits

- No confirmation emails (Razorpay can email its own receipt).
- Two people paying for the very last seat at the same moment can both succeed; the admin panel shows totals so you can handle it.
- Free workshops are not supported by Razorpay checkout (minimum INR 1).
