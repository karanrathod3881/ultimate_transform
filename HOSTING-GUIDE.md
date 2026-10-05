# Hosting guide - Ultimate Transform (see README.md for local setup)

The site is static files plus a few small serverless functions. Everything below has a free plan; plans change, so confirm limits on each provider's pricing page.

## 0. Try it first (demo mode)
Open `index.html`. With an empty `config.js` the site shows three sample workshops, a fake payment and a real downloadable ticket and receipt PDF. The admin page asks you to connect Supabase.

## 1. Supabase (database and admin login)
1. Create a free project at supabase.com.
2. SQL Editor > New query > paste `supabase/schema.sql` > Run.
3. Authentication > Users > Add user (your admin email and a strong password).
4. Run in the SQL Editor (replace the email): `insert into admins (user_id) select id from auth.users where email = 'you@example.com';`
5. Project Settings > API: copy the Project URL and the `anon public` key into `config.js` (`supabaseUrl`, `supabaseAnonKey`). Keep the `service_role` key secret: it goes only into Netlify (step 3).

## 2. Razorpay
1. Sign up at razorpay.com and stay in Test Mode. Settings > API Keys > Generate Test Key.
2. Put the Key Id (`rzp_test_...`) in `config.js` as `razorpayKeyId`. The Key Secret never goes in any website file.
3. Settings > Webhooks > add `https://YOUR-SITE/.netlify/functions/razorpay-webhook`, events `payment.captured` and `order.paid`, and choose a webhook secret.
4. Test with Razorpay's test cards or UPI details, then complete KYC, switch to Live Mode and replace the key with a live one.

## 3. Netlify (free hosting with functions)
1. Put the project in a GitHub repository (recommended) and in Netlify choose Add new site > Import an existing project. Netlify reads `netlify.toml` and deploys the functions.
2. Site settings > Environment variables, add: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
3. Deploy again. Open the site, book a test seat, then check the booking in the admin panel (`/admin.html`).
Other static hosts (Cloudflare Pages, GitHub Pages, Vercel) can serve the pages, but the functions in `netlify/functions` only run on Netlify unless you port them; set `apiBase` in `config.js` to wherever they run.

## 4. Using the admin panel (`/admin.html`)
- Workshops: add, edit, close or delete workshops. Price and seat limits are enforced on the server.
- Bookings: search, filter, export CSV and check people in.
- Check-in: type the ticket number from the QR code or PDF to mark a person as checked in.

## 5. Your content
Edit text and image paths in `resources.js`. Sample content (keys starting with `sample.`) must be replaced: contact details and the demo workshops. See `REPLACE-ME.md`.

## 6. Good to know
- Seats are counted when payment is confirmed. In very busy moments two people could pay for the last seat; the admin panel shows the totals so you can handle this.
- Confirmation emails are not sent. The PDF downloads in the browser; Razorpay can also email its own payment receipt (Dashboard settings).
- Razorpay requires amounts of at least INR 1, so free workshops cannot use this checkout.
