const fs = require('fs');
const path = require('path');

const chatModalPath = path.join(__dirname, '..', 'src', 'components', 'ChatModal.tsx');

console.log('Starting ChatModal checks...');

let issuesFound = 0;

try {
  if (!fs.existsSync(chatModalPath)) {
    console.error(`Error: ChatModal.tsx not found at ${chatModalPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(chatModalPath, 'utf-8');

  // 1. Check for critical sizing classes
  const expectedSizingClasses = ['w-[360px]', 'h-[675px]'];
  // This regex looks for a div that likely is the main modal container and has the sizing classes.
  // It's a bit broad to avoid being too brittle.
  const sizingClassRegex = /<div className=.*bg-white.*shadow-xl(?=.*w-\[360px\])(?=.*h-\[675px\]).*>/;

  if (!sizingClassRegex.test(content)) {
    console.error('Error: ChatModal.tsx does not appear to have the expected sizing classes (w-[360px] and h-[675px]) on its main container.');
    console.error('Expected something like: <div className="...bg-white...shadow-xl...w-[360px]...h-[675px]...">');
    issuesFound++;
  } else {
    console.log('ChatModal sizing classes (w-[360px], h-[675px]) check PASSED.');
  }

  // 2. Check for localStorage access guard
  const localStorageAccessPattern = "localStorage.getItem('chatbotState')";
  const windowGuardPattern = "if (typeof window !== 'undefined')";
  
  let inWindowGuard = false;
  let foundLocalStorageAccess = false;
  let localStorageGuardIssue = false;

  const lines = content.split('\n');
  for (const line of lines) {
    if (line.includes(windowGuardPattern)) {
      inWindowGuard = true;
    }
    if (line.includes(localStorageAccessPattern)) {
      foundLocalStorageAccess = true;
      if (!inWindowGuard) {
        localStorageGuardIssue = true;
        break; 
      }
    }
    if (inWindowGuard && line.includes('}')) { // Simplistic check for end of block
        // This assumes the guard block is relatively simple.
        // A more robust check would require AST parsing.
        // For now, if localStorage was found within this conceptual 'block', we reset.
        if(foundLocalStorageAccess) inWindowGuard = false; 
    }
  }

  if (!foundLocalStorageAccess) {
    console.warn('Warning: localStorage.getItem(\'chatbotState\') pattern not found. If this is unexpected, the test might need an update.');
  } else if (localStorageGuardIssue) {
    console.error('Error: localStorage.getItem(\'chatbotState\') is accessed outside a "typeof window !== \'undefined\'" check.');
    issuesFound++;
  } else {
    console.log('ChatModal localStorage access guard check PASSED.');
  }

  if (issuesFound > 0) {
    console.error(`ChatModal checks FAILED with ${issuesFound} issue(s).`);
    process.exit(1);
  }

  console.log('ChatModal checks PASSED!');
  process.exit(0);

} catch (error) {
  console.error('An error occurred during the ChatModal check process:', error);
  process.exit(1);
} 