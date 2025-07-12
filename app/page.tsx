import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';


export default function Home() {
  return (
    <main className="flex flex-col h-full">
      Hello Homepage สวัสดี
      <div>
        <LoginButton>
          <Button className='cursor-pointer' variant="secondary" size="lg">Login</Button>
        </LoginButton>
      </div>
    </main>
  );
}
