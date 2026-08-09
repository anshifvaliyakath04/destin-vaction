-- destin-next/supabase/migrations/20240101000000_initial_schema.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  email text unique not null,
  phone text,
  whatsapp text,
  address text,
  role text default 'user' check (role in ('user', 'admin')),
  reset_otp text,
  reset_otp_expiry timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trips table
create table public.trips (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_whatsapp text,
  customer_email text not null,
  customer_address text,
  pickup_location text not null,
  destinations text[] not null default '{}',
  start_date text not null,
  duration text not null,
  adults integer not null default 1,
  children integer not null default 0,
  travel_type text not null default 'Couple',
  budget_range text default 'Not specified',
  package_type text default 'Not specified',
  hotel_category text default 'Not specified',
  transport text default 'Not specified',
  activities text[] default '{}',
  food_pref text default 'Any',
  special_requests text default '',
  estimated_price integer default 0,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  payment_status text default 'Pending' check (payment_status in ('Pending', 'Paid')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Testimonials table
create table public.testimonials (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  trip_type text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text not null,
  images text[] default '{}',
  image_url text default '',
  status text default 'Approved' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Settings table
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  whatsapp_number text default '919526886600',
  email_user text default '',
  email_pass text default '',
  email_host text default '',
  email_port integer default 587,
  email_secure boolean default false,
  email_from_name text default 'Destin Vacations',
  email_from_address text default '',
  admin_notification_email text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('testimonial-images', 'testimonial-images', true);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.testimonials enable row level security;
alter table public.settings enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Trips policies
create policy "Trips are viewable by owner or admin" on public.trips for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  or user_id = auth.uid()
);
create policy "Anyone can create a trip" on public.trips for insert with check (true);
create policy "Admins can update trips" on public.trips for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete trips" on public.trips for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Testimonials policies
create policy "Approved testimonials are viewable by everyone" on public.testimonials for select using (status = 'Approved');
create policy "Anyone can insert a testimonial" on public.testimonials for insert with check (true);
create policy "Admins can update testimonials" on public.testimonials for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete testimonials" on public.testimonials for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Settings policies
create policy "Settings are viewable by everyone" on public.settings for select using (true);
create policy "Only admins can update settings" on public.settings for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Storage policies
create policy "Testimonial images are publicly accessible" on storage.objects for select using (bucket_id = 'testimonial-images');
create policy "Anyone can upload testimonial images" on storage.objects for insert with check (bucket_id = 'testimonial-images');
create policy "Admins can update testimonial images" on storage.objects for update using (
  bucket_id = 'testimonial-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete testimonial images" on storage.objects for delete using (
  bucket_id = 'testimonial-images'
  and exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
