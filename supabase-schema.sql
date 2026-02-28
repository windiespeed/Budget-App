-- =====================================================
-- BudgetWise — Supabase Schema
-- Run this entire file in: Supabase Dashboard > SQL Editor
-- =====================================================

-- Profiles (auto-created on signup via trigger)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now()
);

-- Bank Accounts
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  institution_name text,
  account_type text,  -- checking, savings, credit, investment, loan
  balance decimal(12,2) default 0,
  is_manual boolean default true,
  plaid_account_id text unique,
  plaid_item_id text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Transactions
create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete set null,
  amount decimal(12,2) not null,        -- positive = expense, negative = income (Plaid convention)
  description text not null,
  merchant_name text,
  category text,
  transaction_date date not null,
  is_pending boolean default false,
  is_manual boolean default true,
  plaid_transaction_id text unique,
  created_at timestamptz default now()
);

-- Monthly Budgets
create table if not exists budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  amount decimal(12,2) not null,
  month integer not null,   -- 1-12
  year integer not null,
  created_at timestamptz default now(),
  unique(user_id, category, month, year)
);

-- Subscriptions / Recurring Bills
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  amount decimal(12,2) not null,
  billing_cycle text not null,   -- monthly, yearly, quarterly, weekly, biweekly
  next_billing_date date,
  category text,
  status text default 'active',  -- active, paused, cancelled
  website_url text,
  color text,
  notes text,
  created_at timestamptz default now()
);

-- =====================================================
-- Row Level Security (users can only see their own data)
-- =====================================================
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table subscriptions enable row level security;

create policy "Users manage own profiles"
  on profiles for all using (auth.uid() = id);

create policy "Users manage own accounts"
  on accounts for all using (auth.uid() = user_id);

create policy "Users manage own transactions"
  on transactions for all using (auth.uid() = user_id);

create policy "Users manage own budgets"
  on budgets for all using (auth.uid() = user_id);

create policy "Users manage own subscriptions"
  on subscriptions for all using (auth.uid() = user_id);

-- =====================================================
-- Auto-create profile row on new user signup
-- =====================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- Plaid Items (stores access tokens — server-side only)
-- Run this AFTER adding real Plaid integration
-- =====================================================
create table if not exists plaid_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  access_token text not null,
  item_id text unique,
  institution_id text,
  institution_name text,
  created_at timestamptz default now()
);
alter table plaid_items enable row level security;
-- NO public RLS policy intentionally — only the service_role key
-- (used inside Edge Functions) can read or write this table.
-- The access_token is NEVER sent to the browser.
