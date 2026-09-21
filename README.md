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
