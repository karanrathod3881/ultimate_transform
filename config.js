/* Site settings. Leave the values empty to run the site in demo mode. See HOSTING-GUIDE.md.
   The Supabase anon key and Razorpay Key Id are public by design. NEVER put a secret key here. */
window.SITE_CONFIG = {
  supabaseUrl: "https://bhdrrjwumqxwbgjrhyiu.supabase.co",        // e.g. https://abcdxyz.supabase.co
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZHJyand1bXF4d2JnanJoeWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMDE4MzMsImV4cCI6MjEwNjc3NzgzM30.H9bjzz5ivgTX0kzm5nViAxow5FHsP548II7GwRGA0Xc",    // Supabase "anon public" key
  razorpayKeyId: "",      // rzp_test_... first, rzp_live_... when you go live
  apiBase: "/.netlify/functions"
};
