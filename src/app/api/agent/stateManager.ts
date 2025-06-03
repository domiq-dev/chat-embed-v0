// stateManager.ts - Simplified
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
const Model_Name = 'Qwen/Qwen2.5-72B-Instruct-Turbo';
export const runtime = "nodejs";
const chat = new ChatTogetherAI({
      model: Model_Name,
      temperature: 0,
      apiKey: process.env.TOGETHER_API_KEY,
      verbose: false,
    });
export interface ConversationState {
  basicInfo: Record<string, string>;
  qualificationStatus: {
    age: boolean | null;
    income: boolean | null;
    eviction: boolean | null;
  };
  shownFAQ: boolean;
  shownBooking: boolean;
  version: string;
  currentQuestion?: string; // Add this to track what's being asked
}

export const DEFAULT_STATE: ConversationState = {
  basicInfo: {
    full_name: "",
    preferred_name: "",
    apt_size: "",
    move_in_date: ""
  },
  qualificationStatus: {
    age: null,
    income: null,
    eviction: null,
  },
  shownFAQ: false,
  shownBooking: false,
  version: "2.0.0"
};

// Basic required information keys
export const REQUIRED_INFO = ["full_name", "preferred_name", "apt_size", "move_in_date"];

// Check if user is qualified
export function checkIfQualified(state: ConversationState): boolean {
  const { age, income, eviction } = state.qualificationStatus;
  
  return age === true && income === true && eviction === false;
}


// Derive UI hint based on current state
export function deriveUIHint(state: ConversationState): any {

  const hasRequiredInfo = REQUIRED_INFO.some(key =>
    state.basicInfo[key] && state.basicInfo[key].trim() !== ''
  );

  // Show FAQ panel if we haven't shown it yet and user has provided some info
  if (!state.shownFAQ && hasRequiredInfo) {
    return { type: "show_checklist", autoOpen: true };
  }
    


  // Show booking link if qualified and we haven't shown it yet
  if (checkIfQualified(state) && !state.shownBooking) {
    return {
      type: "open_window",
      url: "https://www.grandoaksburlington.com/amenities?show-appointment=true"
    };
  }

  return null;
}

// Add this to stateManager.ts
// Add this to stateManager.ts
export function getCurrentQuestion(state: ConversationState): string | null {
  return state.currentQuestion || null;
}
// In your agent/stateManager.ts, add a function to update state from user input
export function updateStateFromUserInput(
  state: ConversationState,
  currentQuestion: string | null,
  userInput: string
): ConversationState {
  if (!currentQuestion || !userInput.trim()) return state;

  const updatedState = { ...state };

  // Map the current question to the state field
  switch (currentQuestion) {
    case "full_name":
      updatedState.basicInfo.full_name = userInput.trim();
      break;
    case "preferred_name":
      updatedState.basicInfo.preferred_name = userInput.trim();
      break;
    case "bedroom_size":
      updatedState.basicInfo.apt_size = userInput.trim();
      break;
    case "move_in_date":
      updatedState.basicInfo.move_in_date = userInput.trim();
      break;
    case "over_20":
      updatedState.qualificationStatus.age =
        userInput.toLowerCase() === "yes";
      break;
    case "income_requirement":
      updatedState.qualificationStatus.income =
        userInput.toLowerCase() === "yes";
      break;
    case "eviction":
      updatedState.qualificationStatus.eviction =
        userInput.toLowerCase() === "yes";
      break;
      default:
    console.warn("[updateStateFromUserInput] Unrecognized currentQuestion:", currentQuestion);
    break;
  }


  return updatedState;
}
