// 'use client'
// import React, { FC, useState, useEffect } from 'react'
// import { X, MessageSquare, Pen, Home, Lock, Calendar } from 'lucide-react'
//
// // Sparkle burst component
// const SparkleBurst: FC = () => {
//   const sparkles = Array.from({ length: 8 }).map((_, i) => {
//     const angle = (360 / 8) * i
//     const rad = (angle * Math.PI) / 180
//     const distance = 50
//     const x = distance * Math.cos(rad)
//     const y = distance * Math.sin(rad)
//     return (
//       <span
//         key={i}
//         className="absolute bg-yellow-400 rounded-full w-2 h-2 animate-ping"
//         style={{ transform: `translate(${x}px, ${y}px)` }}
//       />
//     )
//   })
//   return <>{sparkles}</>
// }
//
// // Progress ring around an icon with pulse
// interface ProgressRingProps {
//   radius: number
//   stroke: number
//   progress: number // 0–100
//   color?: string
//   animateUnlock?: boolean
//   children: React.ReactNode
// }
//
// const ProgressRing: FC<ProgressRingProps> = ({
//   radius,
//   stroke,
//   progress,
//   color = '#3b82f6',
//   animateUnlock,
//   children,
// }) => {
//   const normalizedRadius = radius - stroke
//   const circumference = normalizedRadius * 2 * Math.PI
//   const dashOffset = circumference - (progress / 100) * circumference
//   const gradientId = `gradient-${Math.random().toString(36).substring(2, 8)}`
//
//   return (
//     <svg
//       width={radius * 2}
//       height={radius * 2}
//       className={animateUnlock ? 'animate-pulse' : ''}
//     >
//       {/* Gradient Definition */}
//       <defs>
//         <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
//           <stop offset="0%" stopColor="#3b82f6" /> {/* Blue */}
//           <stop offset="100%" stopColor="#10b981" /> {/* Green */}
//         </linearGradient>
//       </defs>
//
//       {/* Background Ring */}
//       <circle
//         stroke="#e5e7eb"
//         fill="none"
//         strokeWidth={stroke}
//         r={normalizedRadius}
//         cx={radius}
//         cy={radius}
//       />
//
//       {/* Progress Ring */}
//       <circle
//         stroke={progress >= 100 ? `url(#${gradientId})` : color}
//         fill="none"
//         strokeWidth={stroke}
//         r={normalizedRadius}
//         cx={radius}
//         cy={radius}
//         strokeDasharray={`${circumference} ${circumference}`}
//         strokeDashoffset={dashOffset}
//         strokeLinecap="round"
//         style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.4s ease' }}
//       />
//
//       {/* Inner Content */}
//       <foreignObject
//         x={stroke}
//         y={stroke}
//         width={normalizedRadius * 2}
//         height={normalizedRadius * 2}
//       >
//         <div className="flex items-center justify-center w-full h-full">
//           {children}
//         </div>
//       </foreignObject>
//     </svg>
//   )
// }
//
// // Reusable action button
// type ActionProps = {
//   icon?: React.ReactNode
//   label: string
//   progress?: number
//   locked?: boolean
//   animateUnlock?: boolean
//   showBurst?: boolean
//   onClick?: () => void
// }
// const ActionButton: FC<ActionProps> = ({ icon, label, progress, locked, animateUnlock, showBurst, onClick }) => {
//   const hasProgress = typeof progress === 'number'
//   return (
//     <button onClick={onClick} className="relative flex flex-col items-center focus:outline-none group">
//       {/* Sparkles */}
//       {showBurst && <SparkleBurst />}
//
//       <div className={hasProgress ? 'relative' : ''}>
//         {hasProgress ? (
//           <ProgressRing
//             radius={44}
//             stroke={4}
//             progress={progress!}
//             color={progress === 0 ? '#d1d5db' : '#3b82f6'}
//             animateUnlock={animateUnlock}
//           >
//             <div className="text-gray-700 transition">
//               {locked ? <Lock size={28} /> : <Pen size={28} />}
//             </div>
//           </ProgressRing>
//         ) : (
//           <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center transition group-hover:bg-blue-50">
//             <div className="text-gray-700 group-hover:text-blue-600 transition">
//               {icon}
//             </div>
//           </div>
//         )}
//       </div>
//
//       {/* Badge */}
//       {hasProgress && !locked && (
//         <span className="absolute top-0 right-0 bg-green-500 text-white text-xs font-semibold rounded-full px-2 py-0.5">
//           Ready to Sign!
//         </span>
//       )}
//
//       <span
//         className={`mt-2 text-sm font-medium transition ${
//           locked ? 'text-gray-500' : 'text-gray-700 group-hover:text-blue-600'
//         }`}
//       >
//         {label}
//       </span>
//     </button>
//   )
// }
//
// // Main ChatModal component
//
// interface ChatModalProps {
//   onClose: () => void
// }
//
// export const ChatModal: FC<ChatModalProps> = ({ onClose }) => {
//   const [mode, setMode] = useState<'Voice' | 'Text'>('Text')
//   const [messages, setMessages] = useState<{ from: 'agent' | 'user'; text: string }[]>([
//     {
//       from: 'agent',
//       text: 'Hi! I’m Jerome. If you have questions about our properties or want to schedule a tour, I’m here to help! 😊',
//     },
//     { from: 'agent', text: 'To start, may I please have your name?' },
//   ])
//   const [input, setInput] = useState('')
//   const [signedClicked, setSignedClicked] = useState(false)
//
//   // Progress logic
//   const userCount = messages.filter((m) => m.from === 'user').length
//   const progress = Math.min((userCount / 5) * 100, 100)
//   const signLocked = progress < 100
//   const animateUnlock = progress === 100 && !signedClicked
//   const showBurst = animateUnlock
//
//   const sendMessage = () => {
//     if (!input.trim()) return
//     setMessages((prev) => [...prev, { from: 'user', text: input }])
//     setInput('')
//   }
//
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
//       <div className="bg-white w-full max-w-md h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
//         {/* Header */}
//         <header className="flex items-center justify-between px-5 py-4 border-b bg-white">
//           <div className="flex items-center gap-3">
//             <img src="/realtor.png" alt="Jerome" className="w-10 h-10 rounded-full object-cover border" />
//             <div>
//               <h2 className="text-lg font-semibold">Jerome</h2>
//               <p className="text-xs text-gray-500">Your real-time leasing agent</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-800">
//             <X size={20} />
//           </button>
//         </header>
//
//         {/* Mode Tabs */}
//         <div className="flex mx-5 my-4 border border-gray-200 rounded-full overflow-hidden">
//           {(['Voice', 'Text'] as const).map((m) => (
//             <button
//               key={m}
//               onClick={() => setMode(m)}
//               className={`flex-1 py-2 text-center text-sm font-medium transition ${
//                 mode === m ? 'bg-blue-600 text-white' : 'text-gray-600'
//               }`}
//             >
//               {m === 'Text' ? (
//                 <span className="flex items-center gap-1 justify-center">
//                   <MessageSquare size={16} /> Text
//                 </span>
//               ) : (
//                 'Voice'
//               )}
//             </button>
//           ))}
//         </div>
//
//         {/* Messages */}
//         <div className="flex-1 px-4 overflow-y-auto space-y-4 bg-[#f9f9f9] py-4">
//           {messages.map((msg, idx) =>
//             msg.from === 'agent' ? (
//               <div key={idx} className="flex items-start gap-2">
//                 <img src="/realtor.png" alt="Jerome" className="w-8 h-8 rounded-full border object-cover" />
//                 <div className="bg-white text-gray-800 px-4 py-2 rounded-2xl shadow max-w-[75%] text-sm">
//                   {msg.text}
//                 </div>
//               </div>
//             ) : (
//               <div key={idx} className="flex justify-end">
//                 <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl max-w-[75%] text-sm">{msg.text}</div>
//               </div>
//             )
//           )}
//         </div>
//
//         {/* Input Area & Actions */}
//         <div className="border-t bg-white px-4 py-3">
//           <div className="flex items-center gap-2 mb-3">
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//               placeholder="Type a message..."
//               className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
//             />
//             <button
//               onClick={sendMessage}
//               className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
//               aria-label="Send"
//             >
//               ➤
//             </button>
//           </div>
//
//           <div className="flex justify-around">
//             <ActionButton icon={<Calendar size={28} />} label="In‑Person Tour" />
//             <ActionButton
//               label="Sign Pre‑Lease"
//               progress={progress}
//               locked={signLocked}
//               animateUnlock={animateUnlock}
//               showBurst={showBurst}
//               onClick={() => {
//                 if (!signLocked) setSignedClicked(true)
//                 // trigger signing flow
//               }}
//             />
//             <ActionButton icon={<Home size={28} />} label="Virtual Tour" />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }