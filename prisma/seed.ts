import db from "@/lib/db";
import bcrypt from "bcryptjs";
import fs from 'node:fs'
import path from "node:path";

async function main() {
  // seed user admin
  const hashedPassword = await bcrypt.hash("1234", 10)
  await db.user.upsert({
    where: { username: "admin" },
    update: { password: hashedPassword },
    create: {
      username: "admin",
      password: hashedPassword,
    },
  })
  console.log('Seeded admin success!')

  // seed teams
  const teamsPath = path.join(__dirname, 'teams.json')
  const teamsRaw = fs.readFileSync(teamsPath, 'utf-8')
  const teamsFromJson = JSON.parse(teamsRaw) as { name: string }[]

  const teams = teamsFromJson.map(team => ({
    name: team.name,
    status: true,
  }))

  await db.team.createMany({
    data: teams,
    skipDuplicates: true,
  })

  console.log('Seeded teams success!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })