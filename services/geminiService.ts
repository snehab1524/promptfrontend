
import { API_BASE_URL } from '../api';

export const getAIFeedback = async (userPrompt: string, task: string): Promise<string> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found. Please login.');
    }

    const response = await fetch(`${API_BASE_URL}/api/ai-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        userPrompt,
        task,
        model: 'gemini-3-flash-preview'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.feedback || 'Great effort! Keep practicing to refine your skills.';

  } catch (error) {
    console.error("AI Feedback Error:", error);
    return "Great effort! Keep practicing to refine your skills.";
  }
};
