// stateEvaluator.ts
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { ConversationState } from './stateManager';

const evaluationModel = new ChatTogetherAI({
  model: 'Qwen/Qwen1.5-0.5B-Chat', // Use a smaller, faster model for this
  temperature: 0,
  apiKey: process.env.TOGETHER_API_KEY,
});

export async function evaluateConversationState(state: ConversationState): Promise<{
  missingBasicInfo: string[];
  missingQualInfo: string[];
  isQualified: boolean;
  currentQuestion: string | null;
}> {
  const prompt = `
  Analyze this conversation state and determine:
  1. What basic information is missing (from full_name, preferred_name, apt_size, move_in_date)
  2. What qualification information is missing (from age, income, eviction)
  3. Whether the user is qualified (age=true, income=true, eviction=false)
  4. What question should be asked next (null if no specific question needed)

  Conversation state:
  ${JSON.stringify(state, null, 2)}

  Return your analysis as a JSON object with these properties:
  missingBasicInfo, missingQualInfo, isQualified, currentQuestion
  `;

  try {
    const response = await evaluationModel.invoke(prompt);
    const result = JSON.parse(response.content.toString());
    return result;
  } catch (error) {
    console.error('Error evaluating conversation state:', error);

    // Fallback to basic logic if LLM evaluation fails
    const missingBasicInfo = ['full_name', 'preferred_name', 'apt_size', 'move_in_date'].filter(
      (key) => !state.basicInfo[key] || state.basicInfo[key].trim() === '',
    );

    const missingQualInfo = [];
    if (state.qualificationStatus.age === null) missingQualInfo.push('age');
    if (state.qualificationStatus.income === null) missingQualInfo.push('income');
    if (state.qualificationStatus.eviction === null) missingQualInfo.push('eviction');

    const isQualified =
      state.qualificationStatus.age === true &&
      state.qualificationStatus.income === true &&
      state.qualificationStatus.eviction === false;

    // Determine next question
    let currentQuestion = null;
    if (missingBasicInfo.length > 0) {
      const questionMap: Record<string, string> = {
        full_name: 'full_name',
        preferred_name: 'preferred_name',
        apt_size: 'bedroom_size',
        move_in_date: 'move_in_date',
      };
      currentQuestion = questionMap[missingBasicInfo[0]];
    } else if (missingQualInfo.length > 0) {
      const questionMap: Record<string, string> = {
        age: 'over_20',
        income: 'income_requirement',
        eviction: 'eviction',
      };
      currentQuestion = questionMap[missingQualInfo[0]];
    } else if (isQualified) {
      currentQuestion = 'next_steps';
    }

    return { missingBasicInfo, missingQualInfo, isQualified, currentQuestion };
  }
}
