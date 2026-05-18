create table public.customers (
  id uuid not null default gen_random_uuid (),
  name text not null,
  created_at timestamp with time zone null default now(),
  is_archived boolean null default false,
  constraint customers_pkey primary key (id),
  constraint customers_name_key unique (name)
) TABLESPACE pg_default;

create index IF not exists idx_customers_name on public.customers using btree (name) TABLESPACE pg_default;
create table public.login_activity (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  timestamp timestamp with time zone null default now(),
  ip_address text null,
  location text null,
  device text null,
  browser text null,
  status text null,
  is_suspicious boolean null default false,
  constraint login_activity_pkey primary key (id),
  constraint login_activity_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint login_activity_status_check check (
    (
      status = any (array['success'::text, 'failed'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_login_activity_timestamp on public.login_activity using btree ("timestamp") TABLESPACE pg_default;

create index IF not exists idx_login_activity_user_id on public.login_activity using btree (user_id) TABLESPACE pg_default;
create table public.me_item_types (
  id uuid not null default gen_random_uuid (),
  item_id uuid not null,
  name text not null,
  unit text null,
  quantity bigint null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  is_archived boolean null default false,
  constraint item_types_pkey primary key (id),
  constraint unique_item_variant unique (item_id, name),
  constraint item_types_item_id_fkey foreign KEY (item_id) references me_items (id) on delete CASCADE,
  constraint item_types_quantity_check check ((quantity >= 0))
) TABLESPACE pg_default;

create index IF not exists idx_item_types_item_id on public.me_item_types using btree (item_id) TABLESPACE pg_default;
create table public.me_items (
  id uuid not null default gen_random_uuid (),
  name text not null,
  created_at timestamp with time zone null default now(),
  is_archived boolean null default false,
  constraint items_pkey primary key (id),
  constraint items_name_key unique (name)
) TABLESPACE pg_default;

create index IF not exists idx_items_name on public.me_items using btree (name) TABLESPACE pg_default;
create table public.me_sales (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  sale_id bigint not null,
  customer_id uuid not null,
  item_type_id uuid not null,
  quantity bigint not null,
  pending bigint null default 0,
  done boolean not null default false,
  done_time timestamp without time zone null,
  constraint me_sales_pkey primary key (id),
  constraint me_sales_customer_id_fkey foreign KEY (customer_id) references customers (id) on delete RESTRICT,
  constraint me_sales_item_type_id_fkey foreign KEY (item_type_id) references me_item_types (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_sales_sale_id on public.me_sales using btree (sale_id) TABLESPACE pg_default;

create index IF not exists idx_sales_customer_id on public.me_sales using btree (customer_id) TABLESPACE pg_default;
create table public.profiles (
  id uuid not null default gen_random_uuid (),
  username text not null,
  password text not null,
  role text null default 'staff'::text,
  me boolean null default false,
  mayfield boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_username_key unique (username),
  constraint profiles_role_check check (
    (
      role = any (
        array['admin'::text, 'manager'::text, 'staff'::text]
      )
    )
  )
) TABLESPACE pg_default;