// tools.ts - Simplified
import { tool } from "@langchain/core/tools";
import {
  ConversationState,
  DEFAULT_STATE
} from "./agent/stateManager";

// Simple tool to show the FAQ checklist
export const showFAQTool = tool(({ state }: { state?: string }) => {
  console.log("showFAQTool called - displaying leasing checklist");
  // Parse state
  let currentState: ConversationState;
  try {
    currentState = state ? JSON.parse(state) : { ...DEFAULT_STATE };
  } catch (e) {
    console.warn("Error in showFAQTool:", e);
    currentState = { ...DEFAULT_STATE };
  }

  // Update the state
  currentState.shownFAQ = true;

  return {
    reply: "",
    state: JSON.stringify(currentState),
    ui_hint: { type: "show_checklist", autoOpen: true }
  };
}, {
  name: "showFAQ",
  description: "Shows the leasing FAQ checklist panel to help users understand qualification requirements and apartment options."
});

// Simple tool to direct to booking page
export const bookTourTool = tool(({ state }: { state?: string }) => {
  console.log("bookTourTool called - directing to booking page");

  // Parse state
  let currentState: ConversationState;
  try {
    currentState = state ? JSON.parse(state) : { ...DEFAULT_STATE };
  } catch (e) {
    console.warn("Error in bookTourTool:", e);
    currentState = { ...DEFAULT_STATE };
  }

  // Update the state
  currentState.shownBooking = true;

  return {
    reply: "Great! I'm opening our booking page where you can schedule a tour. Looking forward to having you visit our community!",
    state: JSON.stringify(currentState),
    ui_hint: {
      type: "open_window",
      url: "https://www.grandoaksburlington.com/amenities?show-appointment=true"
    }
  };
}, {
  name: "bookTour",
  description: "Opens the tour booking page for qualified users who are ready to schedule a visit."
});