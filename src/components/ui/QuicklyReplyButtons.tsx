"use client";
import React from "react";

interface QuickReplyButtonsProps {
  currentQuestion: string | null;
  onSelect: (value: string) => void;
}

const QuickReplyButtons: React.FC<QuickReplyButtonsProps> = ({ currentQuestion, onSelect }) => {
    if (!currentQuestion) return null;

  // Only show buttons for specific question types
  const validQuestionTypes = [
    "bedroom_size",
    "move_in_date",
    "over_20",
    "income_requirement",
    "eviction",
    "employment_age",
    "household_size",
    "full_name",
    "next_steps"
  ];

  if (!validQuestionTypes.includes(currentQuestion)) return null;


  let options: string[] = [];
  console.log("!!!!!!!!QuickReplyButtons received currentQuestion:", currentQuestion);


  switch (currentQuestion) {
    case "bedroom_size":
      options = ["1 bedroom", "2 bedroom", "3 bedroom"];
      break;


    case "move_in_date":
  return (
    <div className="mt-2 ml-10">
      <div className="bg-gray-50 px-4 py-3 rounded-2xl shadow-sm inline-block">
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}  // Today or later only
          onChange={(e) => {
            const value = e.target.value;
            if (value) onSelect(value);
          }}
          className="bg-white px-3 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-blue-500 focus:outline-none"
        />
      </div>
    </div>
  );

   case "preferred_name":
    return (
      <div className="mt-2 ml-10">
        <input
          type="text"
          name="preferredname"
          autoComplete="nickname"
          placeholder="Enter your preferred name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              if (value.trim()) onSelect(value.trim());
            }
          }}
          className="px-4 py-2 border border-gray-300 rounded-full text-sm shadow w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );

      case "full_name":
    return (
      <div className="mt-2 ml-10">
        <input
          type="text"
          name="fullname"
          autoComplete="name"
          placeholder="Enter your full name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              if (value.trim()) onSelect(value.trim());
            }
          }}
          className="px-4 py-2 border border-gray-300 rounded-full text-sm shadow w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
    case "over_20":
      options = ["Yes", "No"];
      break;
    case "income_requirement":
      options = ["Yes", "No"];
      break;
    case "eviction":
      options = ["Yes", "No"];
      break;
    case "employment_age":
      options = ["Yes", "No"];
      break;
      case "household_size":
      options = ["1", "2", "3"];
      break;

    case "next_steps":
      const tourScheduled = typeof window !== "undefined" && localStorage.getItem("tourScheduled") === "true";
      options = tourScheduled ? ["Ask More Questions"] : ["Schedule in-person tour", "Ask More Questions"];
      break;

    default:
      return null;
  }

  return (
    <div className="flex gap-2 mt-2 ml-10 flex-wrap">
      {options.map((label) => (
        <button
          key={label}
          onClick={() => {
  if (label === "Schedule in-person tour") {
    localStorage.setItem('tourScheduled', 'true');
    window.open('https://www.grandoaksburlington.com/amenities?show-appointment=true', '_blank');
    return;
  }

  if (label === "Ask More Questions") {
    window?.postMessage?.({ type: "showFAQ" }, "*");
  }

  onSelect(label);
}}

          className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm shadow hover:bg-blue-600 transition-all"
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default QuickReplyButtons;
