import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';
import Link from 'next/link';


export default function Home() {
  return (
    <main className="flex flex-col h-full bg-gray-800">
      Hello Homepage สวัสดี
      <div>
        <LoginButton>
          <Button className='cursor-pointer' variant="secondary" size="lg">Login</Button>
        </LoginButton>
        <Button size='lg' asChild><Link href="/dashboard">Dashboard</Link></Button>
      </div>
    </main>
  );
}
