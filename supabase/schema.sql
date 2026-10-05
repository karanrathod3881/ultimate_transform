-- Active: 1773372021957@@127.0.0.1@1729@mysql
-- Run this once in Supabase: SQL Editor > New query > paste > Run.
create extension if not exists pgcrypto;
create table events (
  id uuid primary key default gen_random_uuid(), title text not null, description text, event_date date not null, event_time text, venue text,
  price int not null check (price >= 1), seats_total int not null default 50 check (seats_total >= 1), seats_booked int not null default 0,
  active boolean not null default true, created_at timestamptz default now());
create table bookings (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references events(id) on delete restrict,
  name text not null, email text not null, phone text not null, seats int not null check (seats between 1 and 5), amount int not null,
  status text not null default 'pending', razorpay_order_id text unique, razorpay_payment_id text, ticket_no text unique not null,
  checked_in boolean not null default false, created_at timestamptz default now(), paid_at timestamptz);
create table admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table events enable row level security; alter table bookings enable row level security; alter table admins enable row level security;
create function is_admin() returns boolean language sql security definer stable set search_path = public as $$ select exists (select 1 from admins where user_id = auth.uid()) $$;
create policy "public reads open events" on events for select using (active or is_admin());
create policy "admins manage events" on events for all using (is_admin()) with check (is_admin());
create policy "admins manage bookings" on bookings for all using (is_admin()) with check (is_admin());
create policy "admins read own row" on admins for select using (user_id = auth.uid());
-- Called only by the Netlify functions (service key): marks a booking paid once and counts the seats.
create function confirm_booking(p_order text, p_payment text) returns bookings language plpgsql security definer set search_path = public as $$
declare b bookings;
begin
  update bookings set status = 'paid', razorpay_payment_id = p_payment, paid_at = now() where razorpay_order_id = p_order and status = 'pending' returning * into b;
  if found then update events set seats_booked = seats_booked + b.seats where id = b.event_id;
  else select * into b from bookings where razorpay_order_id = p_order; end if;
  return b;
end $$;
revoke execute on function confirm_booking(text, text) from public, anon, authenticated;
grant execute on function confirm_booking(text, text) to service_role;
-- After creating your admin user in Authentication > Users, run (replace the email):
-- insert into admins (user_id) select id from auth.users where email = 'you@example.com';
-- Optional first workshop (edit the date):
-- insert into events (title, description, event_date, event_time, venue, price, seats_total) values ('Two-Day Foundation Workshop', 'An intensive introduction to Kundalini Awakening.', '2026-11-14', '9:00 AM to 5:00 PM', 'Your venue', 1500, 60);
