-- Create the sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  mode text not null,
  duration_minutes integer not null
);

-- Enable Row Level Security (RLS)
alter table public.sessions enable row level security;

-- Create Policy: Users can insert their own sessions
create policy "Users can insert their own sessions"
on public.sessions for insert
to authenticated
with check (auth.uid() = user_id);

-- Create Policy: Users can view their own sessions
create policy "Users can view their own sessions"
on public.sessions for select
to authenticated
using (auth.uid() = user_id);

-- Optional: Create Policy: Users can update their own sessions (if needed later)
-- create policy "Users can update their own sessions"
-- on public.sessions for update
-- to authenticated
-- using (auth.uid() = user_id);
