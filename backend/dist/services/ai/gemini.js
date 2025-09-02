import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../../config/env.js';
// Initialize Gemini AI client
export const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
// Get model instance with configuration
export function getGeminiModel(modelConfig = {}) {
    const defaultConfig = {
        model: config.gemini.model,
        temperature: 0.7,
        max_output_tokens: 2048,
        safety_settings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
        ]
    };
    const finalConfig = { ...defaultConfig, ...modelConfig };
    const generativeConfig = {
        temperature: finalConfig.temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: finalConfig.max_output_tokens
    };
    // Add tools if specified
    if (finalConfig.tools) {
        generativeConfig.tools = finalConfig.tools;
    }
    return genAI.getGenerativeModel({
        model: finalConfig.model,
        generationConfig: generativeConfig,
        safetySettings: finalConfig.safety_settings
    });
}
// Get model with Google Search tool
export function getGeminiWithSearch() {
    return getGeminiModel({
        tools: [{ googleSearch: {} }]
    });
}
// Get model for vision analysis
export function getGeminiVision() {
    return getGeminiModel({
        temperature: 0.3, // Lower temperature for more consistent identification
        max_output_tokens: 1024
    });
}
// Get model for chat
export function getGeminiChat() {
    return getGeminiModel({
        temperature: 0.8, // Higher temperature for more creative responses
        max_output_tokens: 1024
    });
}
// Generate structured output with schema validation
export async function generateStructuredOutput(prompt, schema, modelConfig = {}) {
    const model = getGeminiModel(modelConfig);
    const structuredPrompt = `
${prompt}

Please respond with a JSON object that strictly follows this schema:
${JSON.stringify(schema, null, 2)}

Important:
- Return ONLY valid JSON
- Include all required fields
- Follow exact property names and types
- Do not include any explanation outside the JSON
`;
    try {
        const result = await model.generateContent(structuredPrompt);
        const response = await result.response;
        const text = response.text();
        // Clean and parse JSON response
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        try {
            return JSON.parse(cleanedText);
        }
        catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Response text:', cleanedText);
            throw new Error(`Failed to parse AI response as JSON: ${parseError}`);
        }
    }
    catch (error) {
        console.error('Gemini API Error:', error);
        throw new Error(`Gemini API call failed: ${error}`);
    }
}
// Generate vision analysis
export async function analyzeImage(imageData, // base64 encoded
prompt, mimeType = 'image/jpeg') {
    const model = getGeminiVision();
    const imagePart = {
        inlineData: {
            data: imageData,
            mimeType
        }
    };
    try {
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        return response.text();
    }
    catch (error) {
        console.error('Gemini Vision Error:', error);
        throw new Error(`Vision analysis failed: ${error}`);
    }
}
// Generate text with search capability
export async function generateWithSearch(prompt) {
    const model = getGeminiWithSearch();
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        // Extract search results if available
        const searchResults = result.candidates?.[0]?.groundingMetadata?.searchEntryPoints || [];
        return {
            text: response.text(),
            searchResults
        };
    }
    catch (error) {
        console.error('Gemini Search Error:', error);
        throw new Error(`Search generation failed: ${error}`);
    }
}
// Test Gemini connection
export async function testGeminiConnection() {
    try {
        const model = getGeminiModel();
        const result = await model.generateContent('Say "Hello" in JSON format: {"message": "Hello"}');
        const response = await result.response;
        const text = response.text();
        // Check if response contains expected content
        if (text.toLowerCase().includes('hello')) {
            console.log('✅ Gemini AI connection successful');
            return true;
        }
        else {
            console.error('❌ Gemini AI response unexpected:', text);
            return false;
        }
    }
    catch (error) {
        console.error('❌ Gemini AI connection test failed:', error);
        return false;
    }
}
// Create chat session
export function createChatSession(systemInstruction) {
    const model = getGeminiChat();
    const config = {};
    if (systemInstruction) {
        config.systemInstruction = systemInstruction;
    }
    return model.startChat(config);
}
// Error handling for Gemini API responses
export function handleGeminiError(error) {
    if (error.message?.includes('quota')) {
        return new Error('API quota exceeded. Please try again later.');
    }
    if (error.message?.includes('safety')) {
        return new Error('Content was blocked due to safety restrictions.');
    }
    if (error.message?.includes('timeout')) {
        return new Error('Request timed out. Please try again.');
    }
    return new Error(`AI service error: ${error.message || 'Unknown error'}`);
}
//# sourceMappingURL=gemini.js.map