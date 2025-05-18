// 'use client'
// import { useState } from 'react'
// import {ChatModal} from '@/components/ChatModal'
//
// export default function HomePage() {
//   const [open, setOpen] = useState(false)
//   return (
//     <>
//       <button onClick={() => setOpen(true)}>Talk to Jerome</button>
//       {open && <ChatModal onClose={() => setOpen(false)} />}
//     </>
//   )
// }
"use client";
import dynamic from 'next/dynamic';
const ChatLauncher = dynamic(() => import('@/components/ChatLauncher'), { ssr: false });


export default function HomePage() {
  return (
    <>
      {/* the rest of your page content */}
      <ChatLauncher />   {/* fixed bottom-right launcher */}
    </>
  );
}
