-- Create SMTP settings table
create table if not exists public.smtp_settings (
    id uuid primary key default gen_random_uuid(),
    host varchar,
    port integer,
    username varchar,
    password varchar,
    from_email varchar,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create SMS settings table
create table if not exists public.sms_settings (
    id uuid primary key default gen_random_uuid(),
    api_key varchar,
    from_number varchar,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Insert initial empty records
insert into public.smtp_settings (host, port, username, password, from_email)
values ('', 587, '', '', '')
on conflict do nothing;

insert into public.sms_settings (api_key, from_number)
values ('', '')
on conflict do nothing;

-- Set up RLS policies
alter table public.smtp_settings enable row level security;
alter table public.sms_settings enable row level security;

-- Create policies for admin access only
create policy "Allow admin full access to SMTP settings"
on public.smtp_settings
for all
to authenticated
using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
);

create policy "Allow admin full access to SMS settings"
on public.sms_settings
for all
to authenticated
using (
    exists (
        select 1 from public.users
        where users.id = auth.uid()
        and users.role = 'admin'
    )
); 