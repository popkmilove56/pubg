# PUBG Tournament Web

เว็บสาธารณะตัวใหม่สำหรับตารางการแข่งขัน คะแนนสด และผลการแข่งขัน โดยพัฒนาแยกจากระบบหลังบ้านเดิมระหว่างการย้ายระบบ

## Local development

1. คัดลอก `.env.example` เป็น `.env.local` และใส่ค่า Supabase
2. ติดตั้ง dependencies ด้วย `npm install`
3. เปิดเว็บด้วย `npm run dev`
4. เข้า `http://localhost:3001`

## Tournament manager

The deployment also serves the existing tournament manager at `/admin`, `/create`, `/teams`, `/control`, `/detail`, `/live`, `/overlay`, and `/observer`. Manage homepage content at `/website`. The content editor uses the same Supabase admin account and requires the `site_content` table, `site-media` Storage bucket, and RLS policies from the root `supabase.sql`. It supports cropping and uploading images for Upcoming Events, Past Tournaments, and Homepage Updates (JPG/PNG/WEBP, up to 20 MB); Upcoming Event cards and selected Past Tournament cards can be reordered without changing tournament records. The public Past Tournaments section initially shows six cards with a control to reveal the rest. Upcoming and Past cards open a details popup, and Homepage Update images appear beside their expanded content. Public Facebook Live/video URLs that permit embedding and YouTube Live URLs can be entered as the stream URL to show the player inline.

The `prebuild` script copies the manager's root-level HTML, JavaScript, and CSS into the public output and applies the shared site theme from `public/admin-assets/main-site-theme.css`. Do not edit the generated files in `public/admin/` or the generated copies in `public/admin-assets/`; update the original manager files at the repository root instead.
