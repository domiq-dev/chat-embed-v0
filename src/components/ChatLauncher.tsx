'use client';

import { useState, useEffect } from 'react';
import ChatModal from './ChatModal';
const ChatLauncher = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);

  useEffect(() => {
    // Set a short delay before opening (500ms)
    // This gives the page time to load first
    const timer = setTimeout(() => {
      setOpen(true);
    }, 500);

    // Clean up the timer if component unmounts
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ overflow: 'visible' }}>
      {/* ────────── ChatModal card ────────── */}
      {open && (
        <div className="mb-3" style={{ overflow: 'visible' }}>
          <ChatModal onClose={toggle} /> {/* closes when “X” tapped */}
        </div>
      )}

      {/* ────────── Banner / Bubble ───────── */}
      <div
        onClick={toggle}
        className={`flex items-center transition-all cursor-pointer hover:shadow-xl
          bg-white/90 backdrop-blur-md shadow-lg border border-gray-300
          ${open
            ? 'w-14 h-14 p-0 justify-center rounded-full gap-0'   // avatar-only
            : 'px-5 py-2 pr-3 rounded-full gap-3'}                // pill banner
        `}
        style={{ overflow: 'visible' }}
      >
        {!open && ( /* banner text only when closed */
          <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
            Contact
            <span className="font-semibold"> Live Leasing Agent Now</span>!
          </span>
        )}

        <img
          src="/realtor.png"
          alt="Leasing Agent"
          className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
        />
      </div>
    </div>
  );
};

export default ChatLauncher;

// 'use client';
//
// import { useState } from 'react';
// import ChatModal from './ChatModal';
//
// const ChatLauncher = () => {
//   const [open, setOpen] = useState(false);
//   const toggle = () => setOpen((v) => !v);
//
//   return (
//     <div className="fixed bottom-6 right-6 z-50" style={{ overflow: 'visible' }}>
//       {open && (
//         <div className="mb-3" style={{ overflow: 'visible' }}>
//           <ChatModal onClose={toggle} /> {/* This handles restoring saved conversation */}
//         </div>
//       )}
//
//       <div
//         onClick={toggle}
//         className={`flex items-center transition-all cursor-pointer hover:shadow-xl
//           bg-white/90 backdrop-blur-md shadow-lg border border-gray-300
//           ${open
//             ? 'w-14 h-14 p-0 justify-center rounded-full gap-0'
//             : 'px-5 py-2 pr-3 rounded-full gap-3'}
//         `}
//         style={{ overflow: 'visible' }}
//       >
//         {!open && (
//           <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
//             Talk with our&nbsp;
//             <span className="font-semibold">Real-time Leasing Agent</span>!
//           </span>
//         )}
//
//         <img
//           src="/realtor.png"
//           alt="Leasing Agent"
//           className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
//         />
//       </div>
//     </div>
//   );
// };
//
// export default ChatLauncher;
