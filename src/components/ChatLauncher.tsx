'use client';

import { useState, useEffect } from 'react';
import ChatModal from './ChatModal';

const ChatLauncher = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggle = () => {
    setOpen((v) => !v);
    if (!open) {
      // Clear unread count when opening the chat
      setUnreadCount(0);
    }
  };

  // Handle visibility change to clear unread count when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && open) {
        setUnreadCount(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [open]);

  // Initial auto-open with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50" style={{ overflow: 'visible' }}>
      {/* ────────── ChatModal card ────────── */}
      {open && (
        <div className="mb-3" style={{ overflow: 'visible' }}>
          <ChatModal 
            onClose={toggle} 
            unreadCount={unreadCount}
            onClearUnread={() => setUnreadCount(0)}
          />
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

        <div className="relative">
          <img
            src="/realtor.png"
            alt="Leasing Agent"
            className="w-12 h-12 rounded-full object-cover border-2 shadow-md"
          />
          {!open && unreadCount > 0 && (
            <div 
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce"
            >
              {unreadCount}
            </div>
          )}
        </div>
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
