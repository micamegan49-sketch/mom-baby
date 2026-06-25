-- ตัวจิ๋ว — ฟังก์ชันลบบัญชีและข้อมูลถาวร (เรียกจากในแอป)
-- ข้อกำหนด App Store Guideline 5.1.1(v): แอปที่สมัครบัญชีได้ ต้องลบบัญชีได้จากในแอป
--
-- หมายเหตุ: ทุก foreign key ที่ชี้ไป auth.users ถูกตั้ง ON DELETE CASCADE อยู่แล้ว
-- (homes.owner_id, home_members.user_id, invites.created_by) และ homes→app_state/members/invites
-- ก็ CASCADE → ลบ auth.users แถวเดียว ข้อมูลที่เหลือถูกลบตามทั้งหมดโดยอัตโนมัติ
--
-- วิธีติดตั้ง: เปิด Supabase Dashboard → SQL Editor → วางทั้งหมดนี้ → กด Run

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  -- ลบบัญชีผู้ใช้ออกจากระบบยืนยันตัวตน → ข้อมูลที่เกี่ยวข้องถูกลบตาม (ON DELETE CASCADE)
  delete from auth.users where id = auth.uid();
end;
$$;

-- ให้ผู้ใช้ที่ล็อกอินแล้ว (มี JWT) เรียกฟังก์ชันนี้ได้
grant execute on function public.delete_account() to authenticated;
