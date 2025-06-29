'use client';

import { LoginButton } from '@/components/login-button';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">AIR Kit Login Demo</h1>
        <LoginButton />
      </div>
    </main>
  )
}
