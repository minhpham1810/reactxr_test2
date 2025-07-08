import { GoogleGenerativeAI } from "@google/generative-ai";

const GeminiAPI = {
    getApiKey() {
        const apiKey = import.meta.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            console.error('REACT_APP_GEMINI_API_KEY is not set in environment');
            return null;
        }
        return apiKey;
    },

    async generateSortSuggestion(array) {
        try {
          const apiKey = this.getApiKey();
          if (!apiKey) throw new Error('Gemini API key is not configured');
    
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
          const prompt = `You are an expert programming tutor. Given the array: [${array.join(', ')}], what is the best next step for insertion sort? Reply concisely, but only give guidance, do not explicitly tell the user what to do. Make the response short and concise.`;
    
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          return text;
        } catch (error) {
          console.error('Error generating suggestion:', error);
          return `Unable to generate suggestion: ${error.message}`;
        }
      }
    };

export default GeminiAPI;