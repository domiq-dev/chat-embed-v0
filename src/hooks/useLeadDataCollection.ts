"use client";
import { useState } from 'react';

interface LeadData {
  // Maps to your 'user' table
  user: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    lead_source: string;
  };
  
  // Maps to your 'conversation' table
  conversation: {
    chatbot_id: string;
    start_time: Date;
    end_time?: Date;
    is_book_tour: boolean;
    apartment_size_preference?: string;
    price_range_min?: number;
    price_range_max?: number;
    tour_type?: string;
    tour_datetime?: Date;
    move_in_date?: Date;
    is_qualified?: boolean;
    kb_pending?: any;
    ai_intent_summary?: string;
  };
  
  // Maps to your 'message' table
  messages: Array<{
    sender_type: 'user' | 'bot';
    message_text: string;
    timestamp: Date;
  }>;
}

export const useLeadDataCollection = (chatbotId: string) => {
  const [leadData, setLeadData] = useState<LeadData>({
    user: {
      lead_source: 'chat'
    },
    conversation: {
      chatbot_id: chatbotId,
      start_time: new Date(),
      is_book_tour: false
    },
    messages: []
  });

  // Update user information
  const updateUser = (userData: Partial<LeadData['user']>) => {
    setLeadData(prev => ({
      ...prev,
      user: { ...prev.user, ...userData }
    }));
  };

  // Update conversation data
  const updateConversation = (convData: Partial<LeadData['conversation']>) => {
    setLeadData(prev => ({
      ...prev,
      conversation: { ...prev.conversation, ...convData }
    }));
  };

  // Add a message
  const addMessage = (sender: 'user' | 'bot', text: string) => {
    const newMessage = {
      sender_type: sender,
      message_text: text,
      timestamp: new Date()
    };
    
    setLeadData(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const sendLeadData = async () => {
    const finalData = {
      ...leadData,
      conversation: {
        ...leadData.conversation,
        end_time: new Date()
      }
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData)
      });

      if (!response.ok) {
        throw new Error('Failed to save lead data');
      }

      console.log('Lead data saved successfully');
      return await response.json();
    } catch (error) {
      console.error('Error saving lead data:', error);
      throw error;
    }
  };

  return {
    leadData,
    updateUser,
    updateConversation,
    addMessage,
    sendLeadData
  };
}; 