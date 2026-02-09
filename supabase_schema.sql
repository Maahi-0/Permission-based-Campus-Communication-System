-- 1. Create Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  role text check (role in ('student', 'club_lead', 'admin')) default 'student',
  avatar_url text,
  institute_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Policy for leads to search profiles
create policy "Club leads can search profiles by email" on public.profiles
  for select using (
    exists (
      select 1 from public.club_members
      where user_id = auth.uid() and role = 'lead'
    )
  );

-- 2. Create Clubs table
create table public.clubs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  cover_image text,
  logo_url text,
  is_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Club Members table (to assign leads)
create table public.club_members (
  club_id uuid references public.clubs on delete cascade,
  user_id uuid references public.profiles on delete cascade,
  role text check (role in ('lead', 'member')) default 'member',
  primary key (club_id, user_id)
);

-- 4. Create Events table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references public.clubs on delete cascade not null,
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  location text,
  status text check (status in ('draft', 'published', 'cancelled')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.events enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policies for Clubs
create policy "Approved clubs are viewable by everyone" on public.clubs
  for select using (is_approved = true);

create policy "Admins can view all clubs" on public.clubs
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage clubs" on public.clubs
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Policies for Club Members
create policy "Club membership viewable by everyone" on public.club_members
  for select using (true);

-- Policies for Events
create policy "Published events are viewable by everyone" on public.events
  for select using (
    status = 'published' and 
    exists (
      select 1 from public.clubs where id = club_id and is_approved = true
    )
  );

create policy "Club leads can manage their own club events" on public.events
  for all
  using (
    exists (
      select 1 from public.club_members
      where club_id = events.club_id 
      and user_id = auth.uid() 
      and role = 'lead'
    )
  )
  with check (
    exists (
      select 1 from public.club_members
      where club_id = events.club_id 
      and user_id = auth.uid() 
      and role = 'lead'
    )
  );

-- Trigger for profile creation
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role, avatar_url, institute_name)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'institute_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Storage setup for avatars
-- Run these individually if your environment doesn't support multiline storage commands
insert into storage.buckets (id, name, public) values ('profiles', 'profiles', true);

create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'profiles');

create policy "Users can upload their own avatar" on storage.objects
  for insert with check (
    bucket_id = 'profiles' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar" on storage.objects
  for update using (
    bucket_id = 'profiles' and 
    auth.uid()::text = (storage.foldername(name))[1]
  );
