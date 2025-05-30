"use client";
import React from "react";
import { motion } from 'framer-motion';

// Types for different quick reply formats
export type QuickReplyHint = {
  type: QuickReplyType;
  options?: string[];
  placeholder: string;  // Make placeholder required
  min?: number;
  max?: number;
  format?: string;
};

export enum QuickReplyType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  CONFIRMATION = 'CONFIRMATION'
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
          <div className="flex flex-wrap gap-2">
            {hintData.options?.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  trackAnswerButtonClick?.(currentQuestion || 'unknown', option);
                  onSelect(option);
                }}
                className="px-4 py-2 bg-white text-blue-600 rounded-full border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all text-sm font-medium shadow-sm"
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      case QuickReplyType.DATE:
        return (
          <div className="flex flex-col gap-2">
            <input
              type="date"
              min={hintData.min?.toString()}
              max={hintData.max?.toString()}
              onChange={(e) => onSelect(e.target.value)}
              className="px-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case QuickReplyType.NUMBER:
        return (
          <div className="flex flex-col gap-2">
            <input
              type="number"
              min={hintData.min}
              max={hintData.max}
              placeholder={hintData.placeholder}
              onChange={(e) => onSelect(e.target.value)}
              className="px-4 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case QuickReplyType.BOOLEAN:
        return (
          <div className="flex gap-2">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'boolean', hintData.options?.[0] || 'Yes');
                onSelect('true');
              }}
              className="flex-1 px-4 py-2 bg-white text-blue-600 rounded-full border border-blue-200 hover:bg-blue-50 transition-all text-sm font-medium"
            >
              {hintData.options?.[0] || 'Yes'}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'boolean', hintData.options?.[1] || 'No');
                onSelect('false');
              }}
              className="flex-1 px-4 py-2 bg-white text-gray-600 rounded-full border border-gray-200 hover:bg-gray-50 transition-all text-sm font-medium"
            >
              {hintData.options?.[1] || 'No'}
            </motion.button>
          </div>
        );

      case QuickReplyType.CONFIRMATION:
        return (
          <div className="flex gap-2">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'confirmation', hintData.options?.[0] || 'Confirm');
                onSelect('confirm');
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all text-sm font-medium"
            >
              {hintData.options?.[0] || 'Confirm'}
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                trackAnswerButtonClick?.(currentQuestion || 'confirmation', hintData.options?.[1] || 'Start Over');
                onSelect('restart');
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-all text-sm font-medium"
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
    <div className="p-4 border-t bg-gray-50">
      <div className="text-sm text-gray-600 mb-2">
        {hintData.placeholder}
      </div>
      {renderButtons()}
    </div>
  );
};

export default QuickReplyButtons;
