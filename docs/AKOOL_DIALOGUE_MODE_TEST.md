# AKOOL Avatar Dialogue Mode Testing Guide

## Critical Issue Prevention

**PROBLEM SOLVED**: Avatar was echoing user messages instead of engaging in conversation.

**ROOT CAUSE**: Avatar was in retelling mode (`mode: 1`) instead of dialogue mode (`mode: 2`).

**SOLUTION**: Send `set-params` command with `mode: 2` after joining Agora channel.

## Required Dependencies for Tests

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

## Manual Testing Checklist

### 🔍 Pre-Deployment Verification

**Before releasing any chat functionality, verify these steps:**

1. **Open Browser Developer Tools Console**
2. **Start a chat session with the avatar**
3. **Look for these specific console logs:**

```
✅ MUST SEE: "ChatModal: Setting up avatar dialogue mode:"
✅ MUST SEE: Message contains "mode": 2
✅ MUST SEE: "ChatModal: Avatar dialogue mode configured successfully"
```

### 🎯 Critical Test Scenarios

#### Test 1: Dialogue Mode Setup

```
1. Open chat
2. Wait for avatar to load
3. Check console for setup message
4. Verify setup message contains: {"mode": 2}
```

#### Test 2: No Echo Test

```
1. Send message: "Hello"
2. Avatar should respond conversationally
3. Avatar should NOT just say "Hello" back
4. Response should be unique/contextual
```

#### Test 3: Message Order Test

```
1. Monitor network tab or console
2. Verify set-params command is sent BEFORE chat messages
3. Chat messages should only be sent after setup is complete
```

### 🚨 Red Flags (TEST FAILURES)

If you see any of these, the issue has regressed:

❌ **Avatar echoes exact user input**
❌ **Console shows `"mode": 1`**
❌ **No "Setting up avatar dialogue mode" message**
❌ **Chat messages sent before setup command**

### 🔧 Code Verification Points

**In `ChatModal.tsx`, verify these exist:**

```typescript
// ✅ MUST EXIST: Dialogue mode setup function
const setupAvatarDialogueMode = async () => {
  // ✅ MUST HAVE: mode: 2
  data: {
    mode: 2, // Dialogue mode (avatar engages in conversation)
  }
};

// ✅ MUST EXIST: Setup called after joining
currentActiveClient.join(...)
  .then(() => {
    // ✅ MUST HAVE: Setup function called here
    setupAvatarDialogueMode();
  })
```

### 📋 Integration Test Commands

```bash
# Run the dialogue mode test suite
npm test ChatModal.dialogue-mode.test.tsx

# Run specific critical test
npm test -- --testNamePattern="MUST send set-params command with mode: 2"

# Run all avatar-related tests
npm test -- --testPathPattern="avatar|dialogue|akool"
```

### 🎬 Demo Script for Manual Verification

**Use this script with stakeholders:**

1. **Demo Setup**: Open chat, show console logs
2. **Show Problem**: "Previously, avatar would just repeat what you said"
3. **Show Solution**: Point out `mode: 2` in console
4. **Test Conversation**: Send varied messages, show responses are contextual
5. **Verify No Echo**: Send "Test echo" - avatar should respond, not repeat

### 🔄 Regression Prevention

**When making changes to ChatModal.tsx:**

1. **Never change `mode: 2` to `mode: 1`**
2. **Always ensure setup runs after Agora join**
3. **Test in incognito mode (fresh session)**
4. **Test with different browsers**
5. **Run the test suite before deployment**

### 📊 Monitoring and Alerts

**Set up monitoring for:**

- Console errors related to "setup avatar dialogue mode"
- High frequency of identical responses (indicating echo)
- Users reporting "avatar just repeats what I say"

### 🧪 Test Environment Setup

```javascript
// Quick test in browser console
// Paste this after avatar loads:
console.log('Testing for dialogue mode setup...');
const logs = console.log.toString();
if (logs.includes('mode": 2')) {
  console.log('✅ Dialogue mode configured correctly');
} else {
  console.warn('❌ Dialogue mode may not be set up');
}
```

### 📝 Documentation for Future Developers

**Always include in code comments:**

```typescript
// CRITICAL: Avatar MUST be set to dialogue mode (mode: 2)
// to prevent echoing user messages. Do not change to mode: 1.
// See: docs/AKOOL_DIALOGUE_MODE_TEST.md
mode: 2, // Dialogue mode (avatar engages in conversation)
```

### 🎯 Success Criteria

**The avatar integration is working correctly when:**

✅ Console shows proper setup logs
✅ Avatar responds conversationally (not echoing)
✅ No user complaints about repetitive responses
✅ Test suite passes all dialogue mode tests
✅ Manual verification steps pass

---

## Emergency Rollback Plan

**If echo issue returns in production:**

1. **Immediate**: Check console logs for `mode: 1`
2. **Quick Fix**: Verify `setupAvatarDialogueMode` function exists and runs
3. **Verification**: Use manual test checklist above
4. **Deploy**: Run test suite before deployment

**Contact**: Development team immediately if dialogue mode tests fail.
