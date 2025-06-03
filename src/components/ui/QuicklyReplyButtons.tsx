"use client";
import React from "react";
import { motion } from 'framer-motion';

// Types for different quick reply formats
export type QuickReplyHint = {
  type: QuickReplyType;
  options?: string[];
  placeholder: string;  // Make placeholder required
  min?: number | string;  // ✨ Allow both numbers and strings
  max?: number | string;  // ✨ Allow both numbers and strings
  format?: string;
};

export enum QuickReplyType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  CONFIRMATION = 'CONFIRMATION',
  TEXT_INPUT = 'TEXT_INPUT',        // For Full_name, Work_place
  INCENTIVE = 'INCENTIVE',          // Special styling for Sign Me Up vs Turn it Down
  RANGE = 'RANGE',                  // For Price_range slider
  PET_INPUT = 'PET_INPUT'           // Special pet input with name/type/size
}

// Placeholder data - in real app, this would come from backend
const QUICK_REPLY_DATA = {
  bedroom_size: {
    type: QuickReplyType.MULTIPLE_CHOICE,
    options: ['Studio', '1 Bedroom', '2 Bedrooms', '3+ Bedrooms'],
    placeholder: 'What size apartment are you looking for?'
  },
  move_in_date: {
    type: QuickReplyType.DATE,
    placeholder: 'When would you like to move in?',
    min: new Date().toISOString(),
    max: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString() // 6 months from now
  },
  budget: {
    type: QuickReplyType.NUMBER,
    placeholder: 'What\'s your monthly budget?',
    min: 1000,
    max: 5000
  },
  pet_friendly: {
    type: QuickReplyType.BOOLEAN,
    options: ['Yes, I have pets', 'No pets'],
    placeholder: 'Do you have any pets?'
  },
  confirm_details: {
    type: QuickReplyType.CONFIRMATION,
    options: ['Confirm', 'Start Over'],
    placeholder: 'Would you like to proceed?'
  }
} as const;

interface QuickReplyButtonsProps {
  currentQuestion: string | null;
  hint?: QuickReplyHint;
  onSelect: (value: string) => void;
  trackAnswerButtonClick?: (optionId: string, optionText: string) => void;
}

const QuickReplyButtons: React.FC<QuickReplyButtonsProps> = ({
  currentQuestion,
  hint,
  onSelect,
  trackAnswerButtonClick
}) => {
  // If no hint is provided, don't render anything
  if (!hint && !currentQuestion) return null;

  // Get the appropriate hint data either from props or placeholder data
  const hintData = hint || QUICK_REPLY_DATA[currentQuestion as keyof typeof QUICK_REPLY_DATA];
  
  // If no hint data is found, don't render anything
  if (!hintData) return null;

  const renderButtons = () => {
    switch (hintData.type) {
      case QuickReplyType.MULTIPLE_CHOICE:
        return (
          <div className="flex flex-wrap gap-1.5">
            {hintData.options?.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  trackAnswerButtonClick?.(currentQuestion || 'unknown', option);
                  onSelect(option);
                }}
                className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      case QuickReplyType.TEXT_INPUT:
        return (
          <div className="flex flex-wrap gap-1.5">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'text_input', 'text_hint');
                // For text input, we'll trigger the focus on the main input field
                const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (inputElement) {
                  inputElement.focus();
                }
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              {hintData.placeholder}
            </motion.button>
          </div>
        );

      case QuickReplyType.DATE:
        return (
          <div className="flex flex-col w-full max-w-[280px] bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gray-700 mb-2"
            >
              {hintData.placeholder}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <input
                type="date"
                min={typeof hintData.min === 'string' ? hintData.min : new Date().toISOString().split('T')[0]}
                max={typeof hintData.max === 'string' ? hintData.max : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                onChange={(e) => {
                  if (e.target.value) {
                    onSelect(e.target.value);
                    trackAnswerButtonClick?.(currentQuestion || 'date', e.target.value);
                  }
                }}
                style={{ 
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  paddingRight: '34px' // Make room for our custom icon
                }}
                autoFocus
              />
              {/* Custom calendar icon positioned without overlapping */}
              <div 
                className="absolute top-0 right-3 h-full flex items-center z-10 cursor-pointer"
                onClick={() => {
                  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                  if (dateInput) {
                    dateInput.showPicker ? dateInput.showPicker() : dateInput.focus();
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </motion.div>
          </div>
        );

      case QuickReplyType.RANGE:
        return (
          <div className="flex flex-wrap gap-1.5">
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                onSelect('$1000-$1500');
                trackAnswerButtonClick?.(currentQuestion || 'price_range', '$1000-$1500');
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              $1000-$1500
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                onSelect('$1500-$2000');
                trackAnswerButtonClick?.(currentQuestion || 'price_range', '$1500-$2000');
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              $1500-$2000
            </motion.button>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => {
                onSelect('$2000+');
                trackAnswerButtonClick?.(currentQuestion || 'price_range', '$2000+');
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              $2000+
            </motion.button>
          </div>
        );

      case QuickReplyType.NUMBER:
        return null; // For number inputs, we don't show pills

      case QuickReplyType.BOOLEAN:
        return (
          <div className="flex gap-1.5">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'boolean', hintData.options?.[0] || 'Yes');
                onSelect(hintData.options?.[0] || 'Yes');
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              {hintData.options?.[0] || 'Yes'}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'boolean', hintData.options?.[1] || 'No');
                onSelect(hintData.options?.[1] || 'No');
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              {hintData.options?.[1] || 'No'}
            </motion.button>
          </div>
        );

      case QuickReplyType.INCENTIVE:
        return (
          <div className="flex gap-1.5">
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'incentive', hintData.options?.[0] || 'Sign Me Up!');
                onSelect(hintData.options?.[0] || 'Sign Me Up!');
              }}
              className="px-3 py-1.5 bg-green-500/90 text-white rounded-full hover:bg-green-600/90 transition-all text-[13px] shadow-sm font-medium"
            >
              {hintData.options?.[0] || 'Sign Me Up!'}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'incentive', hintData.options?.[1] || 'Turn it Down');
                onSelect(hintData.options?.[1] || 'Turn it Down');
              }}
              className="px-3 py-1.5 bg-white/90 text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-[13px] shadow-sm"
            >
              {hintData.options?.[1] || 'Turn it Down'}
            </motion.button>
          </div>
        );

      case QuickReplyType.PET_INPUT:
        return (
          <div className="flex gap-1.5">
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'pet', 'Yes');
                onSelect('Yes');
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              Yes
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'pet', 'No');
                onSelect('No');
              }}
              className="px-3 py-1.5 bg-blue-500/90 text-white rounded-full hover:bg-blue-600 transition-all text-[13px] shadow-sm"
            >
              No
            </motion.button>
          </div>
        );

      case QuickReplyType.CONFIRMATION:
        return (
          <div className="flex gap-1.5">
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'confirmation', hintData.options?.[0] || 'Confirm');
                onSelect('confirm');
              }}
              className="px-3 py-1.5 bg-green-500/90 text-white rounded-full hover:bg-green-600/90 transition-all text-[13px] shadow-sm font-medium"
            >
              {hintData.options?.[0] || 'Confirm'}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'confirmation', hintData.options?.[1] || 'Start Over');
                onSelect('restart');
              }}
              className="px-3 py-1.5 bg-white/90 text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-[13px] shadow-sm"
            >
              {hintData.options?.[1] || 'Start Over'}
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="px-4 pb-2">
      {renderButtons()}
    </div>
  );
};

export default QuickReplyButtons;

// Add global styles to document head to hide native date picker icons
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    input[type="date"]::-webkit-calendar-picker-indicator {
      display: none !important;
      opacity: 0 !important;
      -webkit-appearance: none !important;
      appearance: none !important;
    }
    input[type="date"]::-webkit-inner-spin-button {
      display: none !important;
      -webkit-appearance: none !important;
    }
    input[type="date"]::-webkit-clear-button {
      display: none !important;
      -webkit-appearance: none !important;
    }
  `;
  document.head.appendChild(style);
}
