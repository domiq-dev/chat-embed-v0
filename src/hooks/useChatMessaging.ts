'use client';
import { useState, useRef } from 'react';
import { ChatMessageForDisplay } from '@/components/chat/types';
import { QuickReplyHint, QuickReplyType } from '@/components/ui/QuicklyReplyButtons';

interface UseChatMessagingProps {
  messages: ChatMessageForDisplay[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessageForDisplay[]>>;
  akoolSession: any;
  isAgoraConnected: boolean;
  isDialogueModeReady: boolean;
  agentState: string | null;
  setAgentState: React.Dispatch<React.SetStateAction<string | null>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  sendToAkool?: (userMessageId: string, llmResponse: string) => Promise<void>;
  onActivity: (activityType: string) => void;
  onAnalytics: {
    trackUserMessage: (text: string) => void;
    trackBotMessage: () => void;
    trackFallback: (reason: string) => void;
    trackAdminHandoffTriggered: (reason: string, stage: string) => void;
    trackCustomerServiceEscalated: (
      escalationType: 'complex_query' | 'user_request' | 'fallback_limit',
      query?: string,
    ) => void;
  };
  onLeadUpdate: {
    addMessage: (sender: 'user' | 'bot', text: string) => void;
    updateConversation: (data: any) => void;
    updateUser: (data: any) => void;
  };
  onStateUpdate: {
    setQualified: React.Dispatch<React.SetStateAction<boolean>>;
    setSavings: React.Dispatch<React.SetStateAction<number>>;
    setShowSparkles: React.Dispatch<React.SetStateAction<boolean>>;
    setUserName: React.Dispatch<React.SetStateAction<string>>;
    setCurrentQuestion: React.Dispatch<React.SetStateAction<string | null>>;
    setCurrentHint: React.Dispatch<React.SetStateAction<QuickReplyHint | null>>;
    setAfterTypingCallback: React.Dispatch<React.SetStateAction<(() => void) | null>>;
    setConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    setTurnId: React.Dispatch<React.SetStateAction<number>>;
  };
  conversationStage: 'initial' | 'engaged' | 'qualified' | 'converted';
  setConversationStage: React.Dispatch<
    React.SetStateAction<'initial' | 'engaged' | 'qualified' | 'converted'>
  >;
  conversationId: string | null;
  turnId: number;
  savings: number;
}

export const useChatMessaging = ({
  messages,
  setMessages,
  akoolSession,
  isAgoraConnected,
  isDialogueModeReady,
  agentState,
  setAgentState,
  setIsTyping,
  sendToAkool,
  onActivity,
  onAnalytics,
  onLeadUpdate,
  onStateUpdate,
  conversationStage,
  setConversationStage,
  conversationId,
  turnId,
  savings,
}: UseChatMessagingProps) => {
  // Helper function to get quick reply hints
  const getQuickReplyHint = (variable: string): QuickReplyHint | null => {
    switch (variable) {
      case 'Full_name':
        return {
          type: QuickReplyType.TEXT_INPUT,
          placeholder: 'Enter your full name',
        };

      case 'Bedroom_size':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['1BR', '2BR', '3BR'],
          placeholder: 'How many bedrooms would you like?',
        };

      case 'Calendar':
        return {
          type: QuickReplyType.DATE,
          placeholder: 'When are you planning to move?',
          min: new Date().toISOString().split('T')[0],
          max: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        };

      case 'User_action':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['Ask Some Questions', 'Schedule A Tour', 'Get Pre-Qualified', 'Apply Now'],
          placeholder: 'How can I best help you, what would you like to do now?',
        };

      case 'Faq':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: [
            'What is Grand Oaks near?',
            'What are the amenities?',
            "What's available/pricing?",
          ],
          placeholder: 'What would you like to know?',
        };

      case 'YES/NO':
        return {
          type: QuickReplyType.BOOLEAN,
          options: ['Yes', 'No'],
          placeholder: 'Please choose:',
        };

      case 'Incentive':
        return {
          type: QuickReplyType.INCENTIVE,
          options: ['Sign Me Up!', 'Turn it Down'],
          placeholder: 'Would you like to save money?',
        };

      case 'Price_range':
        return {
          type: QuickReplyType.RANGE,
          placeholder: 'Do you have a price range in mind?',
          min: 1000,
          max: 5000,
        };

      case 'Work_place':
        return {
          type: QuickReplyType.TEXT_INPUT,
          placeholder: 'Enter your company name',
        };

      case 'Occupancy':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['1', '2', '3', '4'],
          placeholder: 'How many people will be living at your apartment home?',
        };

      case 'Pet':
        return {
          type: QuickReplyType.PET_INPUT,
          options: ['Yes', 'No'],
          placeholder: 'Are you bringing any furry friends with you?',
        };

      case 'Features':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: [
            'Cable & Wifi incl.',
            'Spacious Units',
            'W/D Connections',
            'W/D Included',
            'Quiet and Great Location',
            'Pool & Clubhouse',
            'Business Ctr',
          ],
          placeholder: 'Are you looking for any special features in your home?',
        };

      case 'Tour':
        return {
          type: QuickReplyType.MULTIPLE_CHOICE,
          options: ['In-Person Tour', 'Self-guided Tour', 'Virtual Tour'],
          placeholder: 'What type of tour would you prefer?',
        };

      default:
        return null;
    }
  };

  // Main sendMessage function
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Clear any existing hints immediately to prevent flashing
    onStateUpdate.setCurrentHint(null);
    onStateUpdate.setCurrentQuestion(null);
    onStateUpdate.setAfterTypingCallback(null);

    // Update activity tracking
    onActivity('user_message');

    // Update conversation stage based on message content and context
    if (conversationStage === 'initial' && messages.length > 2) {
      setConversationStage('engaged');
    } else if (onStateUpdate && conversationStage === 'engaged') {
      setConversationStage('qualified');
    }

    const userMessageId = `user-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const userMessage: ChatMessageForDisplay = {
      id: userMessageId,
      from: 'user',
      text: text.trim(),
      sentAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Track user message sent
    onAnalytics.trackUserMessage(text.trim());

    // Track user message
    onLeadUpdate.addMessage('user', text);

    // If AKOOL session is active, send text to AKOOL for TTS
    if (akoolSession && isAgoraConnected && sendToAkool) {
      // Check if dialogue mode is ready before sending messages
      if (!isDialogueModeReady) {
        postTextToBackendAgent(text.trim(), userMessageId);
        return;
      }

      // Add a slight delay before showing typing indicator to make it feel more natural
      setTimeout(() => {
        setIsTyping(true); // Show typing indicator for LLM/AKOOL
      }, 1200); // 1.2 second delay for a more natural feel

      // Call LLM API to get response
      let llmResponse = text.trim(); // fallback

      // Generate conversation ID once, then reuse it
      const currentConversationId = conversationId || `conv-${Date.now()}`;
      const currentTurnId = turnId + 1;

      try {
        const response = await fetch('/api/llm/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_message: text.trim(),
            conversation_id: currentConversationId,
            turn_id: currentTurnId,
            end_signal: false,
          }),
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter((line) => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.completed_reply) {
                  llmResponse = data.completed_reply;
                }

                // Capture initial summary data
                if (data.data?.final_summary) {
                  onLeadUpdate.updateConversation({
                    ai_intent_summary: data.data.final_summary.ai_intent_summary,
                  });
                }

                // Variables update logic
                if (data.final_variables_update) {
                  const activeVariable = Object.keys(data.final_variables_update).find(
                    (key) => data.final_variables_update[key] === true,
                  );

                  if (activeVariable && !setIsTyping) {
                    onStateUpdate.setCurrentQuestion(activeVariable);
                    const hint = getQuickReplyHint(activeVariable);
                    if (hint) {
                      onStateUpdate.setCurrentHint(hint);
                    }
                  } else {
                    if (activeVariable) {
                      const pendingVariable = activeVariable;
                      const pendingHint = getQuickReplyHint(activeVariable);

                      const setHintsAfterTyping = () => {
                        if (pendingVariable) {
                          onStateUpdate.setCurrentQuestion(pendingVariable);
                          if (pendingHint) {
                            onStateUpdate.setCurrentHint(pendingHint);
                          }
                        }
                      };

                      onStateUpdate.setAfterTypingCallback(() => setHintsAfterTyping);
                    } else {
                      onStateUpdate.setCurrentQuestion(null);
                      onStateUpdate.setCurrentHint(null);
                    }
                  }
                }

                // Capture final qualification data
                if (data.completed_reply && data.is_qualified !== undefined) {
                  console.log('useChatMessaging: LLM qualification detected:', data.is_qualified);
                  onLeadUpdate.updateConversation({
                    is_qualified: data.is_qualified,
                    kb_pending: data.kb_pending,
                  });

                  if (data.is_qualified === true) {
                    onStateUpdate.setQualified(true);
                    onStateUpdate.setShowSparkles(true);
                    setTimeout(() => onStateUpdate.setShowSparkles(false), 2000);

                    // Extract and store user information from conversation
                    const nameMatch = llmResponse.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/);
                    if (nameMatch) {
                      const fullName = nameMatch[1];
                      const [firstName, lastName] = fullName.split(' ');
                      onStateUpdate.setUserName(firstName);

                      onLeadUpdate.updateUser({
                        first_name: firstName,
                        last_name: lastName || '',
                      });
                    }

                    // Extract other qualification info from data if available
                    if (data.data?.final_summary) {
                      const summary = data.data.final_summary;
                      onLeadUpdate.updateConversation({
                        is_qualified: true,
                        ai_intent_summary: summary.ai_intent_summary,
                      });
                    }

                    // Trigger confetti effect
                    setTimeout(() => {
                      const confetti = require('canvas-confetti');
                      confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.3 },
                      });
                    }, 500);
                  }
                }
              } catch (parseError) {
                // ignore parsing errors
              }
            }
          }
          // Update conversation state after successful LLM call
          if (!conversationId) {
            onStateUpdate.setConversationId(currentConversationId);
          }
          onStateUpdate.setTurnId(currentTurnId);
        }
      } catch (error) {
        console.error('LLM API error:', error);
      }

      try {
        await sendToAkool(userMessageId, llmResponse);
      } catch (error) {
        console.error('useChatMessaging: Failed to send to AKOOL:', error);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Fallback to existing backend agent if AKOOL is not active
      postTextToBackendAgent(text.trim(), userMessageId);
    }
  };

  // Backend agent posting logic
  const postTextToBackendAgent = async (text: string, originalUserMessageId: string) => {
    setTimeout(() => {
      setIsTyping(true);
    }, 1200);

    // Track activity for backend agent interaction
    onActivity('backend_agent_query');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate typing
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({
            role: m.from === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          agentState,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      let reply = '';
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          reply += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = updated[updated.length - 1];
            if (lastMessage?.from === 'user' && lastMessage.id === originalUserMessageId) {
              updated.push({
                id: `backend-agent-${Date.now()}`,
                from: 'agent',
                text: reply,
                sentAt: new Date(),
              });
            } else if (lastMessage?.from === 'agent') {
              updated[updated.length - 1] = { ...lastMessage, text: reply };
            }
            return updated;
          });
        }
      }

      // Detect escalation patterns in the response
      const lowerReply = reply.toLowerCase();
      if (
        lowerReply.includes('contact our leasing office') ||
        lowerReply.includes('speak with an agent') ||
        lowerReply.includes('call us directly')
      ) {
        onAnalytics.trackAdminHandoffTriggered('automated_escalation', conversationStage);
      }

      // Detect complex queries that might need escalation
      const complexKeywords = [
        'legal',
        'lawsuit',
        'emergency',
        'urgent',
        'complaint',
        'issue',
        'problem',
      ];
      if (complexKeywords.some((keyword) => text.toLowerCase().includes(keyword))) {
        onAnalytics.trackCustomerServiceEscalated('complex_query', text);
      }

      // Track bot message received for backend response
      if (reply) {
        onAnalytics.trackBotMessage();
      }

      const stateRes = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages,
            { from: 'user', text, sentAt: new Date() },
            { from: 'agent', text: reply, sentAt: new Date() },
          ],
          stateFetch: true,
          agentState,
        }),
      });
      if (stateRes.ok) {
        const data = await stateRes.json();
        onStateUpdate.setQualified(data.qualified ?? false);
        setAgentState(data.agentState);

        // Only set up hints if we have a question or hint
        if (data.current_question || data.hint) {
          const pendingQuestion = data.current_question;
          const pendingHint =
            data.hint || (data.current_question ? getQuickReplyHint(data.current_question) : null);

          const setHintsAfterTyping = () => {
            if (pendingQuestion) {
              onStateUpdate.setCurrentQuestion(pendingQuestion);
            }
            if (pendingHint) {
              onStateUpdate.setCurrentHint(pendingHint);
            }
          };

          onStateUpdate.setAfterTypingCallback(() => setHintsAfterTyping);
        } else {
          onStateUpdate.setAfterTypingCallback(() => {
            onStateUpdate.setCurrentQuestion(null);
            onStateUpdate.setCurrentHint(null);
          });
        }

        if (data.savings && data.savings > savings) {
          const startValue = savings;
          const endValue = data.savings;
          const duration = 1000;
          const startTime = Date.now();
          const animateSavings = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
            onStateUpdate.setSavings(currentValue);
            if (progress < 1) requestAnimationFrame(animateSavings);
          };
          requestAnimationFrame(animateSavings);
        }
        if (data.qualified) {
          onStateUpdate.setQualified(true);
          onStateUpdate.setShowSparkles(true);
          setTimeout(() => onStateUpdate.setShowSparkles(false), 2000);

          // Set the user's name for the banner
          const firstName = data.user_info?.full_name
            ? data.user_info.full_name.split(' ')[0]
            : 'there';
          onStateUpdate.setUserName(firstName);
        }
      }

      // Check for fallback patterns in response
      const responseText = reply.toLowerCase();
      if (
        responseText.includes("sorry, i don't understand") ||
        responseText.includes("i'm not sure") ||
        responseText.includes('could you please') ||
        responseText.includes('can you rephrase') ||
        reply.trim().length < 10
      ) {
        onAnalytics.trackFallback('no_match');
      }
    } catch (err) {
      console.error(err);

      onAnalytics.trackFallback('error');

      setMessages((prev) => [
        ...prev,
        {
          id: `err-backend-${Date.now()}`,
          from: 'agent',
          text: 'Sorry, something went wrong 😞',
          sentAt: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    sendMessage,
  };
};
