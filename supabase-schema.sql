create table if not exists public.delivery_records (
  id text primary key,
  asset_type text not null default '소모품',
  event_type text not null default '신규납품',
  delivery_date date,
  hospital text not null,
  manager_name text default '',
  relation_group text default '',
  product_group text not null,
  product_detail text default '',
  item_code text default '',
  quantity numeric not null default 0,
  unit_price numeric not null default 0,
  lot_number text default '',
  expiry_date date,
  accounting_date date,
  registered_at date,
  memo text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.delivery_records
  add column if not exists asset_type text not null default '소모품';

alter table public.delivery_records
  add column if not exists manager_name text default '';

alter table public.delivery_records
  add column if not exists relation_group text default '';

alter table public.delivery_records
  add column if not exists accounting_date date;

create index if not exists delivery_records_hospital_idx
  on public.delivery_records (hospital);

create index if not exists delivery_records_asset_type_idx
  on public.delivery_records (asset_type);

create index if not exists delivery_records_relation_group_idx
  on public.delivery_records (relation_group);

create index if not exists delivery_records_product_group_idx
  on public.delivery_records (product_group);

create index if not exists delivery_records_delivery_date_idx
  on public.delivery_records (delivery_date);

create index if not exists delivery_records_expiry_date_idx
  on public.delivery_records (expiry_date);

create index if not exists delivery_records_accounting_date_idx
  on public.delivery_records (accounting_date);

alter table public.delivery_records enable row level security;

drop policy if exists "delivery_records_select" on public.delivery_records;
create policy "delivery_records_select"
  on public.delivery_records
  for select
  using (true);

drop policy if exists "delivery_records_insert" on public.delivery_records;
create policy "delivery_records_insert"
  on public.delivery_records
  for insert
  with check (true);

drop policy if exists "delivery_records_update" on public.delivery_records;
create policy "delivery_records_update"
  on public.delivery_records
  for update
  using (true)
  with check (true);

drop policy if exists "delivery_records_delete" on public.delivery_records;
create policy "delivery_records_delete"
  on public.delivery_records
  for delete
  using (true);
