# PUBG Scoreboard MVP

## เริ่มใช้งาน

ต้องมี Node.js แล้วสั่งในโฟลเดอร์นี้:

```powershell
node server.js
```

เปิดหน้าแอดมินที่ `http://localhost:8080/?view=admin`

สำหรับ OBS ให้เพิ่ม **Browser Source** และใส่ URL นี้:

```text
http://localhost:8080/?view=overlay
```

ตั้งความกว้าง `500` และความสูง `500` (หรือปรับตามจำนวนทีมที่แสดง) แล้วติ๊กพื้นหลังโปร่งใสตามการตั้งค่า Browser Source ของ OBS

หน้าให้ทีมงานดูคะแนน: `http://localhost:8080/?view=live`

ข้อมูลจะบันทึกใน `scores.json` อัตโนมัติ และทุกหน้าที่เปิดผ่านเซิร์ฟเวอร์เดียวกันจะอัปเดตทันที
