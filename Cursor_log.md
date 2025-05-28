# What changes are made

[Cursor Log]
- File: src/lib/widget/index.ts
- Line ~100: Created TypeScript implementation of widget loader with proper types and interfaces.
- Reason: Improve type safety and maintainability of the widget code.

- File: src/lib/widget/build.ts
- Line ~10: Added build script for widget initialization.
- Reason: Separate build concerns from core widget implementation.

- File: src/app/widget-demo/page.tsx
- Line ~70: Created Next.js page for widget demo with proper styling and documentation.
- Reason: Provide better documentation and testing environment for the widget.

- File: ChatModal.tsx
- Line ~450: Optimized imports, removed unused code, and improved type definitions.
- Reason: Clean up and improve code quality.

- File: public/widget.js, public/widget.min.js, public/demo.html
- Line ~1: Moved widget-related files to src/lib/widget directory.
- Reason: Better organization and maintainability of widget code.

- File: src/lib/widget/types.ts
- Line ~20: Added TypeScript types for widget configuration and messaging.
- Reason: Improve type safety and developer experience.

- File: src/lib/widget/build.config.ts
- Line ~15: Added build configuration for widget using tsup.
- Reason: Set up proper build pipeline for widget distribution.

- File: package.json
- Line ~1: Added build:widget script and tsup dependency.
- Reason: Enable widget building via npm scripts.

Project Structure Updates:
```
src/
  ├── lib/
  │   └── widget/           # Widget-related code
  │       ├── index.ts      # Core widget implementation
  │       ├── build.ts      # Build script
  │       ├── types.ts      # TypeScript types
  │       └── build.config.ts # Build configuration
  ├── app/
  │   └── widget-demo/      # Demo page
  │       └── page.tsx
  └── components/           # React components
      ├── ChatModal.tsx
      ├── ChatLauncher.tsx
      └── ui/
          └── ...
```

## ChatModal.tsx Enhancements
1. Trimmed and optimized ChatModal component
2. Added input validation
   - Disabled chat button when no text is entered
   - Proper input sanitization
3. Added animations using Framer Motion
   - Smooth transitions for messages
   - Typing indicator animation
   - Sparkle effects for celebrations
4. Enhanced UI/UX
   - Added phone and email icons with hover effects
   - Improved message bubbles with timestamps
   - Added live agent badge
   - Responsive layout improvements
5. Backend Integration
   - Added QuickReply system with different types:
     - Multiple choice
     - Date selection
     - Number input
     - Boolean choices
     - Confirmation dialogs
   - State management for agent responses
   - Savings progress tracking with animations
   - Local storage persistence
6. Added Features
   - Unread message counter
   - Typing indicators
   - Floating banner for qualified leads
   - Auto-scrolling chat
   - Message status indicators

## New Components
1. QuickReplyButtons Component
   - Multiple reply types support
   - Animated buttons
   - Customizable placeholders
   - Input validation
   - Responsive design

2. ChatBox Component
   - Clean input interface
   - Disabled state handling
   - Form validation
   - Responsive textarea

3. ChatLauncher Component
   - Auto-open functionality
   - Unread message tracking
   - Responsive design
   - Animated transitions
   - Visibility state management

## Other Improvements
1. Added proper TypeScript types and interfaces
2. Improved error handling
3. Added loading states
4. Enhanced accessibility
5. Optimized performance with proper React hooks usage

Build Process:
1. Run `npm run build:widget` to generate widget bundle
2. Output: `public/widget.min.js`
3. Deploy to CDN: `https://chat.domiq.ai/widget.min.js`

## Route Segment Configuration Updates
1. Updated `/embed/agent/page.tsx` to use modern Next.js configuration
   - Removed deprecated `export const config = { dynamic: 'force-dynamic' }`
   - Replaced with `export const revalidate = 0` for dynamic page revalidation
   - This change aligns with Next.js 13+ best practices for route segment configuration

## New Features and Improvements

### Countdown Offer Feature
- Added sophisticated countdown timer to increase conversions
- Files affected:
  - `src/components/ui/CountdownOffer.tsx` (new)
  - `src/components/ChatModal.tsx`
- Key features:
  - Professional, non-intrusive design
  - 15-minute countdown with progress bar
  - Appears after 30 seconds of chat engagement
  - Smart visibility logic (hides after qualification)
  - Smooth animations and transitions
  - Configurable timing and messaging

## Configuration Cleanup and __dirname Error Fix

[Cursor Log]
- File: middleware.ts
- Line ~3: Added Edge runtime specification and updated matcher patterns.
- Reason: Fix __dirname errors by ensuring middleware runs in Edge runtime and doesn't process static files.

- File: next.config.js
- Line 1: Simplified configuration to only handle output mode.
- Reason: Remove potential conflicts in route handling that were causing __dirname errors.

[Cursor Log]
- File: tsconfig.json
- Line ~10: Updated moduleResolution to "node" and cleaned up configuration.
- Reason: Fix __dirname errors by using Node.js-style module resolution.

- File: next.config.js
- Line ~5: Added webpack configuration to handle Node.js modules.
- Reason: Fix __dirname errors by properly excluding Node.js-specific packages from client bundle.

[Cursor Log]
- File: src/app/embed/agent/page.tsx, src/app/embed/agent/layout.tsx
- Line ~1: Moved revalidation config to layout file and switched to force-dynamic.
- Reason: Fix build error by properly configuring dynamic rendering at the layout level.

## Tailwind CSS Styling Fix (Local Environment)

- **Problem:** Local dev environment (`npm run dev`) failed to apply Tailwind CSS. Unprocessed `@tailwind` directives appeared in served CSS, while direct Tailwind CLI builds worked. This pointed to an issue in the Next.js CSS pipeline on the specific machine.
- **Resolution:**
    1.  Standard troubleshooting (config verification, cache clearing, Node.js version check).
    2.  **Key Fix - PostCSS Configuration Adjustment:**
        - Renamed `postcss.config.mjs` (ESM) to `postcss.config.js` (CommonJS).
        - Explicitly added `tailwindcss: {}` and `autoprefixer: {}` to `plugins` in `postcss.config.js`.
        - Installed `autoprefixer` as a dev dependency.
    3.  This resolved the issue, and styles loaded correctly after clearing `.next` and restarting the dev server.
- **Suspected Cause:** Conflict or misinterpretation of the ESM `postcss.config.mjs` or Tailwind's implicit autoprefixer within the local Next.js dev setup.
- **Preventative Measure:**
    - Added `tests/check-tailwind-build.js` script.
    - This script runs a production build (`npm run build`) and checks the output CSS in `.next/static/css` for unprocessed `@tailwind` directives, aiming to catch similar issues early.

### Previous Changes
// ... existing code ...

## AKOOL Avatar Integration - Phase 1: Backend and Service Setup

- **Installed `agora-rtc-sdk-ng`:** Added the necessary Agora SDK for AKOOL video avatar functionality.
- **Created AKOOL Token API Route (`src/app/api/akool-token/route.ts`):** Implemented a secure backend API route to fetch AKOOL access tokens using Client ID and Secret stored in `.env.local`. This keeps sensitive credentials off the client-side.
- **Developed `ApiService` (`src/services/apiService.ts`):** Created a TypeScript class to encapsulate interactions with the AKOOL API. This service includes methods for creating/closing sessions, and listing available languages, voices, and avatars, providing a structured way to call AKOOL endpoints.
- **Added `AkoolAvatar.tsx` placeholder:** Created an initial placeholder component for the avatar display.
- **Added `akool-test/page.tsx`:** Created a test page for isolated testing of the AKOOL avatar integration.
- **Configured `vercel.json`:** Added a `vercel.json` file with basic Next.js configuration and permissive headers (including Content-Security-Policy) to facilitate Vercel deployment.

## AKOOL Avatar Integration - Phase 2: Isolated Test Page Implementation

- **Avatar Listing & Session Creation:** 
  - Modified `src/app/akool-test/page.tsx` to use `ApiService` to fetch and display a list of available AKOOL avatars.
  - Implemented functionality to create a live avatar session with a selected avatar, retrieving Agora credentials (`appId`, `channel`, `token`, `uid`).
- **Agora RTC Integration for Video/Audio:**
  - Dynamically imported `agora-rtc-sdk-ng` to avoid SSR `window is not defined` errors.
  - Implemented Agora client setup to join the specified channel using the fetched credentials.
  - Handled `user-published` events to subscribe to and play the remote avatar's video and audio tracks, rendering the live video in a designated player div.
  - Added cleanup logic to leave the Agora channel when the session ends or the component unmounts.
- **Text-to-Speech (TTS) Functionality:**
  - Added an input field and send button to the test page.
  - Implemented `handleSendText` to construct the required JSON payload (with `type: "chat"` and text) and send it to the avatar via `agoraClient.sendStreamMessage()`.
  - The avatar now speaks the sent text, and lip-sync is visible.
- **Chat Display & UI/UX Refinements:**
  - Implemented a basic chat log on the test page to display user-sent messages and text responses received from the avatar via `stream-message`.
  - Added state (`hasVideoStarted`) and styling to improve the video player UI (hiding "Waiting for video..." message after video starts, centering video).
- **Error Handling & Debugging:**
  - Addressed and resolved React duplicate key warnings in the chat log by ensuring uniquely generated keys (`window.crypto.randomUUID()`) for both user and bot messages, especially handling the case where the bot echoes back the user's message ID.
  - Added `// @ts-ignore` for a persistent linter error related to `sendStreamMessage` type definitions, assuming runtime correctness.
  - Resolved linter errors related to potentially null Agora client instances after dynamic import by adding appropriate guards and checks.
  - Added detailed console logging for various states and IDs to aid debugging.

## UI Refinements and Basic Scripted Checks

- **Fractional Star Rating:** Modified the `StarRating` component in `src/components/ChatModal.tsx` to accurately display fractional star ratings (e.g., 4.4 stars will show the 5th star 40% filled) using a foreground/background star clipping technique.
- **Consistent ChatModal Sizing:** 
  - Removed `scale-[0.9]` transform from `ChatModal.tsx` to ensure it renders at its natural size.
  - Adjusted the `ChatModal` width to `w-[360px]` and set a fixed height of `h-[600px]` to ensure consistent sizing across environments and prevent layout issues caused by short initial content.
- **Introduced Script-Based Source Code Checks:**
  - Created `tests/check-chat-modal.js` to perform basic static checks on `src/components/ChatModal.tsx`:
    - Verifies the presence of critical Tailwind CSS sizing classes (`w-[360px]`, `h-[600px]`).
    - Checks that `localStorage.getItem('chatbotState')` is accessed within a `typeof window !== 'undefined'` guard.
  - Added an npm script `test:scripts` to `package.json` to run both `tests/check-tailwind-build.js` and `tests/check-chat-modal.js` with a single command.
- **Testing Plan Discussion:** Outlined a high-level testing strategy, recommending:
  - Unit/integration tests for components using Jest and React Testing Library (RTL), focusing on render checks and basic interactions.
  - End-to-end (E2E) smoke tests with Playwright or Cypress for critical user flows.
  - Continued use of TypeScript and ESLint for static analysis.

## ChatModal.tsx Video Overlay & Styling Refinements

- **AKOOL Avatar Integration into `ChatModal.tsx`:**
  - Modified `ChatLauncher.tsx` to fetch AKOOL token and create session, passing `akoolSession` data to `ChatModal`.
  - Integrated Agora SDK logic (dynamic import, client setup, event handlers for video/audio/TTS) directly into `ChatModal.tsx`.
  - Added logic to `sendMessage` in `ChatModal.tsx` to route TTS to AKOOL if a session is active, falling back to the existing backend agent otherwise.
  - Resolved "avatar busy" error by updating `DEFAULT_AVATAR_ID` to a known working ID.
  - Re-enabled logic to close AKOOL sessions when the modal is closed.
- **Visual Styling for Video Overlay:**
  - **Dynamic Video Player Sizing:** The video player in `ChatModal.tsx` was styled to display underneath the header by dynamically measuring the header's height using a `ref` and adjusting the video player's `top` and `height` CSS properties accordingly.
  - **Message Bubble Styling:**
    - User message bubbles styled with a blue-to-purple gradient (`bg-gradient-to-br from-blue-500/[.90] to-purple-500/[.90]`).
    - Agent message text color changed to `text-black` for better contrast on the video.
    - User message timestamps styled with `text-white/90`.
    - Main text content (via `ReactMarkdown`) within user messages conditionally styled `text-white`.

## ChatModal.tsx Structural Refactor and Clear Zone for Avatar

- **Component Refactoring:** `ChatModal.tsx` was refactored by extracting its main UI sections into four conceptual sub-components (defined within the same file):
  - `ChatHeader`: Displays agent info, social links, and close button.
  - `ChatBody`: Manages the display of messages and the visual space for the video.
  - `TimerSection`: Handles quick replies, countdown offers, and savings progress.
  - `MessagingInput`: Contains the text input and send button.
- **Persistent Clear Zone for Avatar:**
  - **Objective**: Ensure the top part of the video avatar (where the face is) remains unobstructed by chat messages, even when scrolling.
  - **Implementation in `ChatBody`:**
    - The overall `ChatModal` height was adjusted (initially to 750px, then to 675px).
    - The `ChatBody` was structured with a two-part layout using flexbox:
      1.  A **static, non-scrollable clear zone div** at the top with a fixed height (initially 280px, then 200px, finalized at 180px).
      2.  A **scrollable message list div** below it, taking up the remaining vertical space.
    - The global video player (`id={AKOOL_PLAYER_ID}`) was positioned absolutely behind all `ChatModal` content sections (header, body, timer, input), filling the space below the header.
- **Vanishing Effect for Messages:**
  - To create a smoother transition where messages appear to fade out at the top of the scrollable area (entering the clear zone), a CSS `mask-image` was applied to the scrollable messages container.
  - The mask uses a `linear-gradient` (e.g., `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 20px, black 40px)`) to transition the message visibility from fully transparent at the top edge of the scrollable area to fully opaque over a 40px distance, with an intermediate step for a smoother easing effect.

## Chat Loading Sequence and Avatar Handling of Session Timeouts

*   **Improved Chat Loading Sequence & Visual Transitions:**
    *   Addressed issues causing infinite loading screens or jarring intermediate visual states (e.g., white/black screen flashes) when loading the Akool video avatar.
    *   Iteratively refined state management for loading screens between `ChatLauncher.tsx` and `ChatModal.tsx`.
    *   The final approach involves `ChatLauncher.tsx` handling the initial session creation loading. Once a session is established, `ChatModal.tsx` renders and manages its own full-modal loading screen (`AvatarLoadingScreen` controlled by the `isAvatarBuffering` state).
    *   This internal `ChatModal.tsx` loading screen persists until the Agora video track's 'first-frame-decoded' event fires, ensuring a direct and smooth transition from loading to the visible video avatar.

*   **Graceful Handling of Avatar Session Timeouts:**
    *   Implemented a "Session Ended" overlay in `ChatModal.tsx` to address the avatar video feed going black after a period of inactivity (due to Akool session timeout, e.g., 5 minutes).
    *   A new state, `showSessionEndedOverlay`, controls the visibility of this overlay.
    *   The overlay is triggered when the Agora video track is unpublished (`handleUserUnpublished` event for video).
    *   It informs the user that the session has ended (e.g., due to inactivity) and provides a "Close Chat" button to allow them to restart the session by reopening the chat.
    *   The overlay is reset when a new session starts or when a video track successfully begins playing.


## Exponential Backoff Introduced for Error Handling
- Implemented exponential backoff retry mechanism in ApiService for handling AKOOL API errors
- Added automatic retries with increasing delays (1s, 2s, 4s, 8s, 16s) when avatars are busy or network errors occur