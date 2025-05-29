# Testing Suite for Chat Embed Application

## 📁 Test Files

```
tests/
├── jest.config.js                     # Jest configuration
├── jest.setup.js                      # Jest environment setup and mocks
├── ChatModal.dialogue-mode.test.tsx   # AKOOL dialogue mode tests (13)
├── ChatModal.structure.test.tsx       # Component structure tests (15)
├── check-chat-modal.js                # ChatModal file validation
└── check-tailwind-build.js            # Tailwind build validation
```

## 🚀 Commands

### **Main Commands**
```bash
npm run test:all                 # All tests (30 total)
npm run test:components          # Jest tests only (28)
npm run test:validation          # File validation only (2)
```

### **Development**
```bash
npm run test:components:watch    # Watch mode
npm run test:all:no-build        # Skip build checks
```

### **Specific Tests**
```bash
npm run test:dialogue-mode       # Dialogue mode only (13)
npm run test:structure           # Structure only (15)
npm run test:chatmodal-check     # File validation only
npm run test:tailwind            # Build validation only
```

## 📊 Current Status

```
✅ Component Tests: 28/28 passing
✅ Validation: 2/2 passing
🎯 Total: 30 validations
```

## 🧪 What Each File Tests

- **dialogue-mode.test.tsx**: Prevents avatar echoing by ensuring `mode: 2` (dialogue) is set
- **structure.test.tsx**: Component layout, SSR compatibility, state management
- **check-chat-modal.js**: File structure and sizing classes validation
- **check-tailwind-build.js**: CSS build process validation

## ⚡ Quick Workflow

```bash
# Development
npm run test:components:watch

# Before commit
npm run test:all:no-build

# Before deploy
npm run test:all
```

## 🔧 Configuration

- **Jest Config**: `tests/jest.config.js` (points to project root)
- **Test Pattern**: `tests/**/ChatModal*.test.{js,jsx,ts,tsx}`
- **Mocks**: Agora RTC SDK, Next.js router, react-markdown

## 🚨 Critical

**Dialogue mode tests prevent avatar echoing** - if these fail, the avatar will repeat user messages instead of responding conversationally. Always ensure `mode: 2` is set in AKOOL setup. 