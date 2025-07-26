Esport

## Getting Started

เริ่มต้นด้วยการสร้าง Auth Secret Key:
```bash
npx auth secret
```
และควรใส่ AUTH_URL ลงใน .env ด้วย

คำสั่งสร้าง prisma connect:
```bash
npx prisma init --datasource-provider mysql
```
หรือ
DATABASE_URL="mysql://root:password@localhost:3306/mydatabase"

ทำการ Migrations ให้ตรงกับ Schema เดิม:
```bash
npx prisma migrate deploy # สำหรับใช้งานจริง
```
or
```bash
npx prisma migrate dev # สำหรับพัฒนา
```
