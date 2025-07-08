import { GoogleGenerativeAI } from "@google/generative-ai";

const GeminiAPI = {
    getApiKey() {
        const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not set in environment');
            return null;
        }
        return GEMINI_API_KEY;
    },

    async generateSortSuggestion(array) {
        try {
          const apiKey = this.getApiKey();
          console.log('current apu: ' + apiKey);
          if (!apiKey) throw new Error('Gemini API key is not configured');
    
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
          const prompt = `You are an expert programming tutor. Given the array: [${array.join(', ')}], what is the best next step for insertion sort? Reply concisely, but only give guidance. Make the response short and concise.`;
    
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