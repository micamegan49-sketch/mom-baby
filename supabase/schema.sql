-- ตัวจิ๋ว 👣 — สคีมา Supabase (รองรับแชร์หลายบัญชี: บ้าน/ครัวเรือน + สมาชิก + คำเชิญ)
-- วิธีใช้: Supabase Dashboard → SQL Editor → วางทั้งไฟล์ → Run  (รันซ้ำได้ idempotent)
-- หมายเหตุ: ไฟล์นี้จะ "ล้างตาราง app_state แบบเก่า" (ที่ผูกกับ user เดี่ยว) แล้วสร้างใหม่แบบผูกกับบ้าน
--           ข้อมูลในเครื่อง (localStorage) ไม่หาย — ล็อกอินในแอพแล้วจะอัปขึ้นบ้านให้เอง

create extension if not exists pgcrypto;

-- ========== ตาราง ==========
-- บ้าน = หน่วยที่แชร์กัน (ลูก ๆ + บันทึก ทั้งหมดอยู่ใต้บ้านเดียว)
create table if not exists public.homes (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'ครอบครัวของฉัน',
  created_at timestamptz not null default now()
);

-- สมาชิกในบ้าน
create table if not exists public.home_members (
  home_id   uuid not null references public.homes(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      text not null default 'editor',          -- owner | editor | viewer
  email     text,
  joined_at timestamptz not null default now(),
  primary key (home_id, user_id)
);

-- คำเชิญ (รหัสสั้น หมดอายุใน 14 วัน)
create table if not exists public.invites (
  code       text primary key,
  home_id    uuid not null references public.homes(id) on delete cascade,
  role       text not null default 'editor',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

-- ข้อมูลแอพ — เก็บต่อ "บ้าน"
drop table if exists public.app_state cascade;
create table public.app_state (
  home_id    uuid primary key references public.homes(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  client_id  text,
  updated_at timestamptz not null default now()
);

-- ========== ฟังก์ชันช่วย (SECURITY DEFINER กัน RLS เรียกวนซ้ำ) ==========
create or replace function public.is_home_member(h uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.home_members m where m.home_id = h and m.user_id = auth.uid());
$$;

create or replace function public.is_home_owner(h uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.homes hh where hh.id = h and hh.owner_id = auth.uid());
$$;

create or replace function public.can_edit_home(h uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.home_members m
    where m.home_id = h and m.user_id = auth.uid() and m.role in ('owner','editor'));
$$;

-- สร้างบ้านให้ผู้ใช้ถ้ายังไม่มี → คืน home_id ของบ้านที่ตัวเองเป็นเจ้าของ
create or replace function public.ensure_home()
returns uuid language plpgsql security definer set search_path = public as $$
declare hid uuid;
begin
  select id into hid from public.homes where owner_id = auth.uid() limit 1;
  if hid is null then
    insert into public.homes(owner_id) values (auth.uid()) returning id into hid;
    insert into public.home_members(home_id, user_id, role, email)
      values (hid, auth.uid(), 'owner', (select email from auth.users where id = auth.uid()))
      on conflict do nothing;
  end if;
  return hid;
end $$;

-- เจ้าของสร้างรหัสเชิญ → คืนรหัส
create or replace function public.create_invite(h uuid, r text default 'editor')
returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not public.is_home_owner(h) then raise exception 'not_owner'; end if;
  if r not in ('editor','viewer') then r := 'editor'; end if;
  c := upper(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
  insert into public.invites(code, home_id, role, created_by) values (c, h, r, auth.uid());
  return c;
end $$;

-- รับคำเชิญ → เพิ่มตัวเองเป็นสมาชิก คืน home_id
create or replace function public.redeem_invite(invite_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare inv public.invites;
begin
  select * into inv from public.invites where code = upper(trim(invite_code));
  if inv.code is null then raise exception 'invite_not_found'; end if;
  if inv.expires_at < now() then raise exception 'invite_expired'; end if;
  insert into public.home_members(home_id, user_id, role, email)
    values (inv.home_id, auth.uid(), inv.role, (select email from auth.users where id = auth.uid()))
    on conflict (home_id, user_id) do update set role = excluded.role;
  return inv.home_id;
end $$;

-- ========== RLS ==========
alter table public.homes        enable row level security;
alter table public.home_members enable row level security;
alter table public.invites      enable row level security;
alter table public.app_state    enable row level security;

-- homes: สมาชิกเห็นได้ / เจ้าของแก้-ลบ
drop policy if exists homes_sel on public.homes;
create policy homes_sel on public.homes for select using (public.is_home_member(id));
drop policy if exists homes_ins on public.homes;
create policy homes_ins on public.homes for insert with check (owner_id = auth.uid());
drop policy if exists homes_upd on public.homes;
create policy homes_upd on public.homes for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists homes_del on public.homes;
create policy homes_del on public.homes for delete using (owner_id = auth.uid());

-- home_members: สมาชิกเห็นรายชื่อ / เจ้าของเพิ่ม-ลบได้ / ตัวเองออกเองได้
-- (การเข้าร่วมด้วยรหัสเชิญทำผ่าน redeem_invite ซึ่งข้าม RLS อย่างปลอดภัย)
drop policy if exists hm_sel on public.home_members;
create policy hm_sel on public.home_members for select using (public.is_home_member(home_id));
drop policy if exists hm_ins on public.home_members;
create policy hm_ins on public.home_members for insert with check (public.is_home_owner(home_id));
drop policy if exists hm_del on public.home_members;
create policy hm_del on public.home_members for delete using (public.is_home_owner(home_id) or user_id = auth.uid());

-- invites: เฉพาะเจ้าของบ้านจัดการ
drop policy if exists inv_all on public.invites;
create policy inv_all on public.invites for all using (public.is_home_owner(home_id)) with check (public.is_home_owner(home_id));

-- app_state: สมาชิกอ่านได้ / คนที่มีสิทธิ์แก้ (owner/editor) เขียนได้
drop policy if exists as_sel on public.app_state;
create policy as_sel on public.app_state for select using (public.is_home_member(home_id));
drop policy if exists as_ins on public.app_state;
create policy as_ins on public.app_state for insert with check (public.can_edit_home(home_id));
drop policy if exists as_upd on public.app_state;
create policy as_upd on public.app_state for update using (public.can_edit_home(home_id)) with check (public.can_edit_home(home_id));

-- ========== Realtime ==========
do $$ begin alter publication supabase_realtime add table public.app_state;    exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.home_members; exception when duplicate_object then null; end $$;
