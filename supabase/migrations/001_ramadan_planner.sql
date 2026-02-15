-- Profiles linked to auth.users
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  mode text not null default 'classic' check (mode in ('classic', 'spark')),
  location jsonb not null default '{"lat": 53.5511, "lng": 9.9937, "name": "Hamburg"}',
  madhab text not null default 'hanafi' check (madhab in ('hanafi', 'shafi', 'maliki', 'hanbali')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Yearly planners
create table public.planners (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year_hijri integer not null,
  start_date date not null,
  end_date date not null,
  goals jsonb not null default '{"quran_pages_per_day": 5, "habits": ["dhikr", "dua", "charity"]}',
  created_at timestamptz default now()
);

-- Daily progress entries
create table public.daily_progress (
  id uuid primary key default gen_random_uuid(),
  planner_id uuid references public.planners(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  gregorian_date date not null,
  salah_status jsonb not null default '{"fajr":false,"dhuhr":false,"asr":false,"maghrib":false,"isha":false,"taraweeh":false}',
  quran_pages integer not null default 0,
  fasting boolean not null default true,
  habits jsonb not null default '{}',
  journal_text text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(planner_id, gregorian_date)
);

-- Spark achievements
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  planner_id uuid references public.planners(id) on delete cascade not null,
  type text not null,
  earned_date date not null default current_date,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.planners enable row level security;
alter table public.daily_progress enable row level security;
alter table public.achievements enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

create policy "Users can view own planners" on public.planners for select using (auth.uid() = user_id);
create policy "Users can insert own planners" on public.planners for insert with check (auth.uid() = user_id);
create policy "Users can update own planners" on public.planners for update using (auth.uid() = user_id);

create policy "Users can view own progress" on public.daily_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.daily_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.daily_progress for update using (auth.uid() = user_id);

create policy "Users can view own achievements" on public.achievements for select using (auth.uid() = user_id);
create policy "Users can insert own achievements" on public.achievements for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup via trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
