import { 
  generateQuestions as generateQuestionsFunction,
  saveResponse as saveResponseFunction,
  getInterviewResults as getInterviewResultsFunction
} from './firebase';
import { ref, set, get, push, onValue, off } from 'firebase/database';
import { database } from './firebase';

class InterviewService {
  // Generate questions
  async generateQuestions(jobRole, numQuestions, questionTypes, userId) {
    try {
      const result = await generateQuestionsFunction({
        job_role: jobRole,
        numQuestions,
        questionTypes,
        userId
      });
      
      return result.data;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error(error.message || 'Failed to generate questions');
    }
  }

  // Save interview response
  async saveInterviewResponse(sessionId, questionNumber, questionText, transcript, fillerWords = []) {
    try {
      const responseData = {
        sessionId,
        questionNumber: questionNumber.toString(),
        questionText,
        transcript,
        fillerWords,
        timestamp: Date.now()
      };

      // Save directly to Realtime Database
      const responseRef = ref(database, `interviews/${sessionId}/responses/${questionNumber}`);
      await set(responseRef, responseData);

      // Update session metadata
      const metadataRef = ref(database, `interviews/${sessionId}/metadata`);
      await set(metadataRef, {
        lastUpdated: Date.now(),
        questionsCompleted: await this.getCompletedQuestionsCount(sessionId)
      });

      return {
        success: true,
        sessionId,
        questionNumber,
        responseData
      };

    } catch (error) {
      console.error('Error saving response:', error);
      throw new Error('Failed to save response');
    }
  }

  // Get interview results
  async getInterviewResults(sessionId) {
    try {
      const interviewRef = ref(database, `interviews/${sessionId}`);
      const snapshot = await get(interviewRef);
      
      if (!snapshot.exists()) {
        throw new Error('Interview not found');
      }

      const data = snapshot.val();
      const responses = data.responses || {};
      const questionsCompleted = Object.keys(responses).length;

      return {
        success: true,
        sessionId,
        responses,
        metadata: data.metadata || {},
        complete: questionsCompleted >= 5,
        count: questionsCompleted
      };

    } catch (error) {
      console.error('Error fetching results:', error);
      throw new Error('Failed to fetch results');
    }
  }

  // Real-time listener for interview progress
  listenToInterviewProgress(sessionId, callback) {
    const interviewRef = ref(database, `interviews/${sessionId}`);
    onValue(interviewRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });

    // Return unsubscribe function
    return () => off(interviewRef);
  }

  // Helper: Get completed questions count
  async getCompletedQuestionsCount(sessionId) {
    const responsesRef = ref(database, `interviews/${sessionId}/responses`);
    const snapshot = await get(responsesRef);
    return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
  }

  // Generate unique session ID
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new InterviewService();