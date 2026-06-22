-- ตัวจิ๋ว 👣 — สคีมา Supabase สำหรับคลาวด์ซิงค์
-- วิธีใช้: เปิด Supabase Dashboard → SQL Editor → วางทั้งไฟล์นี้ → Run
-- (รันซ้ำได้ปลอดภัย idempotent)

-- 1) ตารางเก็บ state ของผู้ใช้ — 1 แถวต่อ 1 บัญชี
create table if not exists public.app_state (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  client_id  text,
  updated_at timestamptz not null default now()
);

-- 2) Row Level Security — ให้แต่ละบัญชีเห็น/แก้ได้เฉพาะแถวของตัวเอง
alter table public.app_state enable row level security;

drop policy if exists "own_select" on public.app_state;
create policy "own_select" on public.app_state
  for select using (auth.uid() = user_id);

drop policy if exists "own_insert" on public.app_state;
create policy "own_insert" on public.app_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "own_update" on public.app_state;
create policy "own_update" on public.app_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_delete" on public.app_state;
create policy "own_delete" on public.app_state
  for delete using (auth.uid() = user_id);

-- 3) เปิด Realtime เพื่อซิงค์สดข้ามเครื่อง (ข้ามถ้าเพิ่มไว้แล้ว)
do $$
begin
  alter publication supabase_realtime add table public.app_state;
exception
  when duplicate_object then null;
end $$;
