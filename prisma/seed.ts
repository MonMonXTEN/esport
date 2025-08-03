import db from "@/lib/db";

async function main() {
  await db.tournament.create({
    data: {
      name: "Rov Tournament 2025"
    }
  })
}

main()
  .then(async () => {
    await db.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await db.$disconnect()
    process.exit(1)
  })