-- Create users table (though Supabase handles auth.users, we might want a public profile)
-- For this app, we can just rely on auth.users, but let's create a summaries table

create table public.summaries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  video_url text not null,
  video_title text not null,
  summary text,
  notes text,
  key_takeaways jsonb,
  timestamp_highlights jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.summaries enable row level security;

-- Create policies
create policy "Users can view their own summaries" on public.summaries
  for select using (auth.uid() = user_id);

create policy "Users can insert their own summaries" on public.summaries
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own summaries" on public.summaries
  for update using (auth.uid() = user_id);

create policy "Users can delete their own summaries" on public.summaries
  for delete using (auth.uid() = user_id);
