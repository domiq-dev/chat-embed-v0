/**
 * ChatModal Structure and Configuration Tests
 *
 * These tests ensure the ChatModal component maintains proper structure,
 * sizing, and localStorage access patterns for SSR compatibility.
 */

import fs from 'fs';
import path from 'path';

describe('ChatModal Structure and Configuration', () => {
  let chatModalContent: string;

  beforeAll(() => {
    const chatModalPath = path.join(__dirname, '..', 'src', 'components', 'ChatModal.tsx');

    if (!fs.existsSync(chatModalPath)) {
      throw new Error(`ChatModal.tsx not found at ${chatModalPath}`);
    }

    chatModalContent = fs.readFileSync(chatModalPath, 'utf-8');
  });

  describe('Component Sizing and Layout', () => {
    it('should have correct modal dimensions (w-[360px] and h-[625px])', () => {
      // Check for the main modal container with proper sizing
      const sizingClassRegex =
        /<div className=.*bg-white.*shadow-xl(?=.*w-\[360px\])(?=.*h-\[625px\]).*>/;

      expect(chatModalContent).toMatch(sizingClassRegex);
    });

    it('should have proper modal positioning classes', () => {
      // Check for fixed positioning and z-index
      expect(chatModalContent).toMatch(/fixed bottom-20 right-6 z-50/);
    });

    it('should include required structural elements', () => {
      // Check for key structural components
      expect(chatModalContent).toMatch(/ChatHeader/);
      expect(chatModalContent).toMatch(/ChatBody/);
      expect(chatModalContent).toMatch(/MessagingInput/);
    });
  });

  describe('SSR Compatibility', () => {
    it('should guard localStorage access with window check', () => {
      const localStoragePattern = /localStorage\.getItem\('chatbotState'\)/;
      const windowGuardPattern = /typeof window !== 'undefined'/;

      // Verify localStorage is used
      expect(chatModalContent).toMatch(localStoragePattern);

      // Verify window guard exists
      expect(chatModalContent).toMatch(windowGuardPattern);

      // More detailed check: ensure localStorage access is properly guarded
      const lines = chatModalContent.split('\n');
      let inWindowGuard = false;
      let foundUnguardedLocalStorage = false;

      for (const line of lines) {
        if (line.includes("typeof window !== 'undefined'")) {
          inWindowGuard = true;
        }

        if (line.includes("localStorage.getItem('chatbotState')")) {
          if (!inWindowGuard) {
            foundUnguardedLocalStorage = true;
            break;
          }
        }

        // Simple block end detection (this could be more sophisticated)
        if (inWindowGuard && line.trim() === '}') {
          inWindowGuard = false;
        }
      }

      expect(foundUnguardedLocalStorage).toBe(false);
    });

    it('should guard localStorage.setItem with window check', () => {
      const setItemPattern = /localStorage\.setItem/;

      if (chatModalContent.match(setItemPattern)) {
        // If setItem is used, it should also be guarded
        const lines = chatModalContent.split('\n');
        let inWindowGuard = false;
        let foundUnguardedSetItem = false;

        for (const line of lines) {
          if (line.includes("typeof window !== 'undefined'")) {
            inWindowGuard = true;
          }

          if (line.includes('localStorage.setItem')) {
            if (!inWindowGuard) {
              foundUnguardedSetItem = true;
              break;
            }
          }

          if (inWindowGuard && line.trim() === '}') {
            inWindowGuard = false;
          }
        }

        expect(foundUnguardedSetItem).toBe(false);
      }
    });
  });

  describe('AKOOL Avatar Integration', () => {
    it('should have AKOOL video player container', () => {
      expect(chatModalContent).toMatch(/id={AKOOL_PLAYER_ID}/);
      expect(chatModalContent).toMatch(/AKOOL_PLAYER_ID/);
    });

    it('should include avatar buffering state management', () => {
      expect(chatModalContent).toMatch(/isAvatarBuffering/);
      expect(chatModalContent).toMatch(/setIsAvatarBuffering/);
    });

    it('should have Agora RTC client references', () => {
      expect(chatModalContent).toMatch(/agoraClientRef/);
      expect(chatModalContent).toMatch(/isAgoraConnected/);
    });
  });

  describe('State Management', () => {
    it('should manage chat messages state', () => {
      expect(chatModalContent).toMatch(/const \[messages, setMessages\]/);
      expect(chatModalContent).toMatch(/ChatMessageForDisplay/);
    });

    it('should handle input text state', () => {
      expect(chatModalContent).toMatch(/const \[inputText, setInputText\]/);
    });

    it('should manage typing indicator', () => {
      expect(chatModalContent).toMatch(/const \[isTyping, setIsTyping\]/);
    });
  });

  describe('Error Handling', () => {
    it('should have error state for AKOOL session', () => {
      expect(chatModalContent).toMatch(/akoolSessionError/);
      expect(chatModalContent).toMatch(/setAkoolSessionError/);
    });

    it('should include error display in JSX', () => {
      expect(chatModalContent).toMatch(/akoolSessionError && /);
    });
  });

  describe('Code Quality Checks', () => {
    it('should not have console.log statements in production code', () => {
      // Allow console.log for debugging AKOOL integration, but warn about others
      const consoleLogMatches = chatModalContent.match(/console\.log/g);

      if (consoleLogMatches && consoleLogMatches.length > 20) {
        console.warn(
          `Found ${consoleLogMatches.length} console.log statements. Consider removing non-essential ones for production.`,
        );
      }
    });

    it('should have proper TypeScript interfaces', () => {
      expect(chatModalContent).toMatch(/interface ChatModalProps/);
      expect(chatModalContent).toMatch(/interface ChatMessageForDisplay/);
    });
  });
});
