import { auth } from "@/lib/auth"
import { SignOutButton } from "@/components/auth-components";

export default async function Home() {
  const session = await auth()

  return (
      <main className="flex flex-col items-center justify-center min-h-screen p-24">
        <h1 className="text-4xl font-bold mb-8">NextAuth v5 Demo</h1>

        {session?.user && (
          <div className="text-center">
            <p className="mb-4">ยินดีต้อนรับ, {session.user.name} ({session.user.username})</p>
            <SignOutButton />
          </div>
        )}

        <div className="mt-8 p-4 border rounded-lg bg-secondary text-secondary-foreground">
          <h2 className="text-lg font-semibold">Session Data:</h2>
          <pre className="mt-2 text-sm whitespace-pre-wrap">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        <p>after</p>
      </main>
  );
}