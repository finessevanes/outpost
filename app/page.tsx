'use client';

import { LoginButton } from '@/components/login-button';

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-8">
        {/* Simple logo */}
        <div className="w-16 h-16 bg-black rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full"></div>
        </div>
        
        <h1 className="text-4xl font-bold">Outpost</h1>
        <p className="text-gray-600">Travel with confidence, earn with every adventure</p>
        
        {/* Feature Images */}
        <div className="flex gap-3 justify-center my-8">
          <div className="w-20 h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg"></div>
          <div className="w-20 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg"></div>
          <div className="w-20 h-14 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-lg"></div>
        </div>
        
        {/* One Feature */}
        <div className="max-w-sm mx-auto p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-sm">Verified Reviews</h3>
              <p className="text-gray-600 text-xs">Every review backed by location proof</p>
            </div>
          </div>
        </div>
        
        <LoginButton />
      </div>
    </main>
  )
}
