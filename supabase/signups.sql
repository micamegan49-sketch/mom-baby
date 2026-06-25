-- ตัวจิ๋ว — ตารางเก็บผู้สมัครร่วมกิจกรรม (ชื่อ + อีเมล จากหน้า promo.html)
-- วิธีติดตั้ง: Supabase Dashboard → SQL Editor → วาง → Run
-- ดูรายชื่อที่สมัคร: Supabase → Table Editor → signups

create table if not exists public.signups (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  note       text,
  created_at timestamptz default now()
);

alter table public.signups enable row level security;

-- ให้ผู้ที่ยังไม่ล็อกอิน (anon) เพิ่มข้อมูลได้ (สำหรับฟอร์มสมัคร)
-- แต่ "อ่านไม่ได้" — เพื่อความเป็นส่วนตัว (เจ้าของดูผ่าน Dashboard ได้)
drop policy if exists signups_insert_anon on public.signups;
create policy signups_insert_anon on public.signups
  for insert to anon with check (true);
