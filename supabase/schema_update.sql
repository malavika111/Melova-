-- schema_update.sql
-- Create memory_logs
create table public.memory_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  video_url text not null,
  video_title text not null,
  summary text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.memory_logs enable row level security;
create policy "Users can view own memory_logs" on public.memory_logs for select using (auth.uid() = user_id);
create policy "Users can insert own memory_logs" on public.memory_logs for insert with check (auth.uid() = user_id);
create policy "Users can delete own memory_logs" on public.memory_logs for delete using (auth.uid() = user_id);

-- Create extracted_data
create table public.extracted_data (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  video_url text not null,
  key_points jsonb,
  takeaways jsonb,
  topics jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.extracted_data enable row level security;
create policy "Users can view own extracted_data" on public.extracted_data for select using (auth.uid() = user_id);
create policy "Users can insert own extracted_data" on public.extracted_data for insert with check (auth.uid() = user_id);

-- Create network_search
create table public.network_search (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  video_url text not null,
  related_videos jsonb,
  related_articles jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.network_search enable row level security;
create policy "Users can view own network_search" on public.network_search for select using (auth.uid() = user_id);
create policy "Users can insert own network_search" on public.network_search for insert with check (auth.uid() = user_id);

-- Create user_config
create table public.user_config (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null unique,
  summary_style text,
  summary_length text,
  theme text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.user_config enable row level security;
create policy "Users can view own user_config" on public.user_config for select using (auth.uid() = user_id);
create policy "Users can insert own user_config" on public.user_config for insert with check (auth.uid() = user_id);
create policy "Users can update own user_config" on public.user_config for update using (auth.uid() = user_id);
