
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Chatbot will use fallback responses.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Fallback rule-based responses
const mockAIResponses = {
  en: {
    road: "Respected Sir/Madam, I humbly request your attention to repair the damaged road in our area. The poor condition of the road is causing great inconvenience to residents and poses safety risks.",
    water: "Respected Sir/Madam, I request you to ensure regular water supply in our locality. We are facing severe water shortage and request immediate action.",
    electricity: "Respected Sir/Madam, I bring to your notice the frequent power cuts in our area. I request you to resolve this issue at the earliest.",
    health: "Respected Sir/Madam, I request your intervention to improve healthcare facilities in our area.",
    education: "Respected Sir/Madam, I request better educational infrastructure and resources for students in our locality.",
    default: "Respected Sir/Madam, I kindly request your attention to address the issue mentioned above at the earliest convenience."
  },
  ta: {
    road: "மாண்புமிகு ஆட்சியர் அவர்களுக்கு, எங்கள் பகுதியில் உள்ள சேதமடைந்த சாலையை பழுது பார்க்க வேண்டுகிறேன். சாலையின் மோசமான நிலை குடியிருப்பாளர்களுக்கு பெரும் சிரமத்தை ஏற்படுத்துகிறது.",
    water: "மாண்புமிகு ஆட்சியர் அவர்களுக்கு, எங்கள் பகுதியில் தொடர்ந்து குடிநீர் வழங்க வேண்டுகிறேன். நாங்கள் கடுமையான தண்ணீர் பற்றாக்குறையை எதிர்கொண்டு வருகிறோம்.",
    electricity: "மாண்புமிகு ஆட்சியர் அவர்களுக்கு, எங்கள் பகுதியில் அடிக்கடி மின்வெட்டு ஏற்படுவதை தெரிவித்துக் கொள்கிறேன். இந்த பிரச்சினையை விரைவில் தீர்க்க வேண்டுகிறேன்.",
    health: "மாண்புமிகு ஆட்சியர் அவர்களுக்கு, எங்கள் பகுதியில் சுகாதார வசதிகளை மேம்படுத்த வேண்டுகிறேன்.",
    education: "மாண்புமிகு ஆட்சியர் அவர்களுக்கு, எங்கள் பகுதி மாணவர்களுக்கு சிறந்த கல்வி வசதிகள் வழங்க வேண்டுகிறேன்.",
    default: "மாண்புமிகு ஆட்சியர் அவர்களுக்கு, மேலே குறிப்பிட்ட பிரச்சினையை விரைவில் தீர்க்க வேண்டுகிறேன்."
  }
};

const detectLanguage = (text: string): 'ta' | 'en' => {
  const tamilPattern = /[\u0B80-\u0BFF]/;
  return tamilPattern.test(text) ? 'ta' : 'en';
};

const getFallbackResponse = (userMessage: string) => {
    const detectedLang = detectLanguage(userMessage);
    const message = userMessage.toLowerCase();
    
    const responses = mockAIResponses[detectedLang];
    
    if (message.includes('road') || message.includes('சாலை')) return responses.road;
    if (message.includes('water') || message.includes('தண்ணீர்') || message.includes('நீர்')) return responses.water;
    if (message.includes('electricity') || message.includes('மின்') || message.includes('power')) return responses.electricity;
    if (message.includes('health') || message.includes('சுகாதார')) return responses.health;
    if (message.includes('education') || message.includes('கல்வி')) return responses.education;
    
    return responses.default;
};

export const generatePetitionText = async (userInput: string): Promise<string> => {
  if (!API_KEY) {
    return getFallbackResponse(userInput);
  }

  const detectedLang = detectLanguage(userInput);
  const languageName = detectedLang === 'ta' ? 'Tamil' : 'English';
  
  const prompt = `
    You are an assistant named Surya, helping a citizen write a formal petition to a government official (like a District Collector or MLA) in India.
    The user's input is: "${userInput}"
    
    Your tasks:
    1.  Detect the language of the user's input. The user is writing in ${languageName}.
    2.  Convert the user's informal message into a single, formal, polite paragraph suitable for a petition.
    3.  The response MUST be in the same language as the input (${languageName}).
    4.  Begin the paragraph with a respectful salutation (e.g., "Respected Sir/Madam," or "மாண்புமிகு ஆட்சியர் அவர்களுக்கு,").
    5.  Do not add any extra text, explanations, or formatting. Just provide the single paragraph.
  `;

  try {
    const response = await ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    return getFallbackResponse(userInput);
  }
};
