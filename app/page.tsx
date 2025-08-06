'use client'
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socketClient';


export default function Home() {

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [])

  return (
    <main className="flex flex-col h-full bg-gray-800">
      Hello Homepage สวัสดี
      <div className='text-white'>
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
      </div>
      <div>
        <LoginButton>
          <Button className='cursor-pointer' variant="secondary" size="lg">Login</Button>
        </LoginButton>
        <Button size='lg' asChild><Link href="/dashboard">Dashboard</Link></Button>
      </div>
    </main>
  );
}
