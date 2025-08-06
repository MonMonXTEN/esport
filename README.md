Esport

## Getting Started

เริ่มต้นด้วยการสร้าง Auth Secret Key:
```bash
npx auth secret
```
(และควรใส่ AUTH_URL ลงใน .env ด้วยหากมีการ deploy)

คำสั่งสร้าง prisma connect:
```bash
npx prisma init --datasource-provider mysql
```
หรือเพิ่ม DATABASE_URL="mysql://root:password@localhost:3306/mydatabase" ลงใน .env

ทำการ Migrations ให้ตรงกับ Schema เดิม:
```bash
npx prisma migrate deploy # สำหรับใช้งานจริง
npx prisma generate
```
or
```bash
npx prisma migrate dev # สำหรับพัฒนา
```

```bash
npx prisma db seed # เพิ่มข้อมูล admin & team 32
```
