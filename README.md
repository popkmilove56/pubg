# PUBG Scoreboard MVP

## เริ่มใช้งาน

เว็บรุ่นออนไลน์ใช้งานผ่าน Supabase และ Vercel โดยไม่ต้องมี server ฝั่ง Node.js

หลัง Deploy เปิดหน้าแอดมินที่ `https://ชื่อโปรเจกต์.vercel.app/admin`

สำหรับ OBS ให้เพิ่ม **Browser Source** และใส่ URL นี้:

```text
https://ชื่อโปรเจกต์.vercel.app/overlay
```

ตั้งความกว้าง `500` และความสูง `500` (หรือปรับตามจำนวนทีมที่แสดง) แล้วติ๊กพื้นหลังโปร่งใสตามการตั้งค่า Browser Source ของ OBS

หน้าให้ทีมงานดูคะแนน: `https://ชื่อโปรเจกต์.vercel.app/live`

ข้อมูลจะบันทึกใน Supabase และทุกหน้าจะอัปเดตผ่าน Supabase Realtime

จัดการเนื้อหาหน้าเว็บสาธารณะได้ที่ `https://ชื่อโปรเจกต์.vercel.app/website` หลังเข้าสู่ระบบแอดมิน ระบบนี้ใช้ตาราง `site_content` และ bucket `site-media` สำหรับอัปโหลดภาพการ์ด Upcoming Events, Past Tournaments และ Homepage Updates (JPG/PNG/WEBP ต้นฉบับไม่เกิน 5 MB) ระบบ crop เป็น WebP 960×540 และจำกัดไฟล์ผลลัพธ์ไม่เกิน 500 KB ก่อนอัปโหลด ส่วนโลโก้ทีมจากหน้า `/teams` รับภาพต้นฉบับไม่เกิน 3 MB แล้วย่อไม่เกิน 384×384 และจำกัด WebP ไม่เกิน 200 KB โดยคงพื้นหลังโปร่งใสไว้ได้ ต้องรัน `supabase.sql` ใน Supabase Dashboard > SQL Editor เพื่อกำหนด bucket และนโยบาย Storage ให้รองรับ WebP และอัปโหลดทับไฟล์เดิม ภาพ Homepage Updates จะแสดงด้านซ้ายของรายละเอียดเมื่อเปิดรายการ จากนั้นเลือก Tournament เดิมเพื่อแสดงใน Past Tournaments โดยใช้ปุ่มลูกศรจัดลำดับการ์ดได้โดยไม่แก้ข้อมูลการแข่งขัน หน้าเว็บแสดง Past Tournaments 6 การ์ดแรกและมีปุ่มแสดงเพิ่มเติม การ์ด Upcoming Events และ Past Tournaments เปิด popup รายละเอียดเมื่อกด ในส่วน Live รองรับการฝัง Facebook Live/วิดีโอสาธารณะและ YouTube Live โดยวาง URL วิดีโอในช่อง STREAM URL

## อัปเดตฐานข้อมูล

หลังอัปเดตโค้ด ให้รัน `supabase.sql` ใน Supabase Dashboard > SQL Editor เพื่อเพิ่มคอลัมน์ Observer และ score adjustments (จำเป็นสำหรับฐานข้อมูลที่สร้างไว้ก่อนหน้านี้)

## Observer Export

1. เปิด **Teams** แล้วเลือก `Teaminfo.csv` และโฟลเดอร์ `TeamIcon` จากชุดไฟล์ Observer จากนั้นกด **IMPORT TEAM LIBRARY** เพื่อบันทึกชื่อทีม ชื่อย่อ สี และโลโก้ไว้ใช้ซ้ำ
2. เปิด Tournament แล้วไปที่ **OBSERVER** เลือกทีมและกำหนด `TeamNumber` สำหรับรายการนั้น เลขจะเริ่มใหม่ทุก Tournament
3. ตรวจ CSV preview แล้วดาวน์โหลด `observer.csv` หรือ ZIP ที่รวม `observer.csv` กับไฟล์โลโก้ตาม `ImageFileName`

CSV ใช้คอลัมน์ `TeamNumber,TeamName,TeamShortName,ImageFileName,TeamColor` และคงค่า TeamColor แบบ Hex 8 ตัวตามไฟล์ต้นฉบับ
