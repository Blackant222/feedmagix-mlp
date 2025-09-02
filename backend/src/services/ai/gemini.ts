import { GoogleGenerativeAI } from '@google/generative-ai'
import { config } from '../../config/env.js'
import { GeminiConfig, GeminiStructuredSchema } from '../../types/ai.types.js'

// Initialize Gemini AI client
export const genAI = new GoogleGenerativeAI(config.gemini.apiKey)

// Get model instance with configuration
export function getGeminiModel(modelConfig: Partial<GeminiConfig> = {}) {
  const defaultConfig: GeminiConfig = {
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
  }

  const finalConfig = { ...defaultConfig, ...modelConfig }

  const generativeConfig: any = {
    temperature: finalConfig.temperature,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: finalConfig.max_output_tokens
  }

  // Prepare model configuration
  const modelConfigObj: any = {
    model: finalConfig.model,
    generationConfig: generativeConfig,
    safetySettings: finalConfig.safety_settings
  }

  // Add tools at root level if specified
  if (finalConfig.tools) {
    modelConfigObj.tools = finalConfig.tools
  }

  return genAI.getGenerativeModel(modelConfigObj)
}

// Get model with Google Search tool
export function getGeminiWithSearch() {
  return getGeminiModel({
    tools: [{ googleSearch: {} }]
  })
}

// Get model for vision analysis
export function getGeminiVision() {
  return getGeminiModel({
    temperature: 0.3, // Lower temperature for more consistent identification
    max_output_tokens: 1024
  })
}

// Get model for chat
export function getGeminiChat() {
  return getGeminiModel({
    temperature: 0.8, // Higher temperature for more creative responses
    max_output_tokens: 1024
  })
}

// Generate structured output with schema validation
export async function generateStructuredOutput<T>(
  prompt: string,
  schema: GeminiStructuredSchema,
  modelConfig: Partial<GeminiConfig> = {}
): Promise<T> {
  const maxRetries = 3
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = getGeminiModel({
        ...modelConfig,
        max_output_tokens: Math.max(modelConfig.max_output_tokens || 8192, 8192), // Ensure sufficient tokens
        temperature: Math.min(modelConfig.temperature || 0.1, 0.1) // Lower temperature for more consistent output
      })
      
      const structuredPrompt = `
${prompt}

Please respond with a JSON object that strictly follows this schema:
${JSON.stringify(schema, null, 2)}

Important:
- Return ONLY valid JSON
- Include all required fields
- Follow exact property names and types
- Do not include any explanation outside the JSON
- Use Persian (Farsi) text for ingredient names and descriptions
- Ensure the response is complete and not truncated
`

      console.log(`Attempt ${attempt}/${maxRetries} - Sending prompt to Gemini:`, structuredPrompt)
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Gemini API request timeout')), 30000) // 30 second timeout
      })
      
      const generatePromise = model.generateContent(structuredPrompt)
      const result = await Promise.race([generatePromise, timeoutPromise]) as any
      const response = await result.response
      const text = response.text()
      
      console.log(`Attempt ${attempt} - Raw Gemini response:`, text)
    
    // Enhanced JSON cleaning and extraction
    let cleanedText = text.trim()
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/```json\s*|\s*```/g, '')
    
    // Remove any leading/trailing non-JSON content
    const jsonStart = cleanedText.indexOf('{')
    const jsonEnd = cleanedText.lastIndexOf('}') + 1
    
    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd)
    }
    
    // Additional cleanup for common issues
    cleanedText = cleanedText
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/,\s*}/g, '}')   // Remove trailing commas
      .replace(/,\s*]/g, ']')   // Remove trailing commas in arrays
      .trim()
    
    console.log('Cleaned JSON text:', cleanedText)
    
    if (!cleanedText || cleanedText.length === 0) {
      throw new Error('Empty response from Gemini API')
    }
    
    try {
      const parsed = JSON.parse(cleanedText)
      console.log('Successfully parsed JSON:', parsed)
      return parsed as T
    } catch (parseError) {
      console.error(`Attempt ${attempt} - JSON Parse Error:`, parseError)
      console.error('Original response:', text)
      console.error('Cleaned text:', cleanedText)
      
      lastError = parseError instanceof Error ? parseError : new Error(String(parseError))
      
      if (attempt === maxRetries) {
        // Try to extract partial JSON if possible on final attempt
        try {
          // Attempt to fix common JSON issues
          let fixedText = cleanedText
          
          // Handle unterminated strings by finding the last complete quote
          if (fixedText.includes('"') && !fixedText.endsWith('"')) {
            const lastQuoteIndex = fixedText.lastIndexOf('"')
            if (lastQuoteIndex > 0) {
              // Check if this quote is properly closed
              const afterQuote = fixedText.substring(lastQuoteIndex + 1)
              if (!afterQuote.match(/^[^"]*"/) && !afterQuote.match(/^[^"]*[,}\]]/)) {
                // Truncate at the last complete quote and add closing quote
                fixedText = fixedText.substring(0, lastQuoteIndex + 1)
              }
            }
          }
          
          // Handle incomplete arrays by removing trailing incomplete elements
          if (fixedText.includes('[') && !fixedText.includes(']')) {
            const lastCommaIndex = fixedText.lastIndexOf(',')
            if (lastCommaIndex > 0) {
              fixedText = fixedText.substring(0, lastCommaIndex)
            }
          }
          
          // Remove trailing incomplete elements after commas
          fixedText = fixedText.replace(/,\s*[^,{}\[\]"]*$/, '')
          
          // Add missing closing brackets and braces
          const openBraces = (fixedText.match(/{/g) || []).length
          const closeBraces = (fixedText.match(/}/g) || []).length
          const openBrackets = (fixedText.match(/\[/g) || []).length
          const closeBrackets = (fixedText.match(/\]/g) || []).length
          
          if (openBrackets > closeBrackets) {
            fixedText += ']'.repeat(openBrackets - closeBrackets)
          }
          
          if (openBraces > closeBraces) {
            fixedText += '}'.repeat(openBraces - closeBraces)
          }
          
          console.log('Attempting to fix JSON:', fixedText)
          const fixedParsed = JSON.parse(fixedText)
          console.log('Fixed and parsed JSON:', fixedParsed)
          return fixedParsed as T
        } catch (fixError) {
          console.error('Failed to fix JSON:', fixError)
          
          // Last resort: try to extract any valid JSON object from the response
          try {
            const jsonMatch = text.match(/{[\s\S]*}/)
            if (jsonMatch) {
              let extractedJson = jsonMatch[0]
              
              // Basic cleanup for extracted JSON
              extractedJson = extractedJson
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']')
                .replace(/"[^"]*$/, '""') // Close unterminated strings
              
              // Try to balance braces and brackets
              const openBraces = (extractedJson.match(/{/g) || []).length
              const closeBraces = (extractedJson.match(/}/g) || []).length
              const openBrackets = (extractedJson.match(/\[/g) || []).length
              const closeBrackets = (extractedJson.match(/\]/g) || []).length
              
              if (openBrackets > closeBrackets) {
                extractedJson += ']'.repeat(openBrackets - closeBrackets)
              }
              if (openBraces > closeBrackets) {
                extractedJson += '}'.repeat(openBraces - closeBraces)
              }
              
              console.log('Attempting last resort JSON extraction:', extractedJson)
              const lastResortParsed = JSON.parse(extractedJson)
              console.log('Last resort parsing successful:', lastResortParsed)
              return lastResortParsed as T
            }
          } catch (lastResortError) {
            console.error('Last resort JSON extraction failed:', lastResortError)
          }
          
          const errorMessage = parseError instanceof Error ? parseError.message : String(parseError)
          throw new Error(`Failed to parse AI response as JSON after ${maxRetries} attempts: ${errorMessage}. Original text: ${text.substring(0, 500)}...`)
        }
      } else {
        console.log(`Attempt ${attempt} failed, retrying...`)
        continue
      }
    }
    } catch (error) {
      console.error(`Attempt ${attempt} - Gemini API Error:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxRetries) {
        throw new Error(`Gemini API call failed after ${maxRetries} attempts: ${lastError.message}`)
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
  
  throw new Error(`All ${maxRetries} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`)
}

// Generate vision analysis
export async function analyzeImage(
  imageData: string, // base64 encoded
  prompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const model = getGeminiVision()
  
  const imagePart = {
    inlineData: {
      data: imageData,
      mimeType
    }
  }

  try {
    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Gemini Vision Error:', error)
    throw new Error(`Vision analysis failed: ${error}`)
  }
}

// Generate text with search capability
export async function generateWithSearch(prompt: string): Promise<{
  text: string
  searchResults?: any[]
}> {
  const model = getGeminiWithSearch()
  
  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    
    // Extract search results if available
    const searchResults = (result as any).candidates?.[0]?.groundingMetadata?.searchEntryPoints || []
    
    return {
      text: response.text(),
      searchResults
    }
  } catch (error) {
    console.error('Gemini Search Error:', error)
    throw new Error(`Search generation failed: ${error}`)
  }
}

// Test Gemini connection
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const model = getGeminiModel()
    const result = await model.generateContent('Say "Hello" in JSON format: {"message": "Hello"}')
    const response = await result.response
    const text = response.text()
    
    // Check if response contains expected content
    if (text.toLowerCase().includes('hello')) {
      console.log('✅ Gemini AI connection successful')
      return true
    } else {
      console.error('❌ Gemini AI response unexpected:', text)
      return false
    }
  } catch (error) {
    console.error('❌ Gemini AI connection test failed:', error)
    return false
  }
}

// Create chat session
export function createChatSession(systemInstruction?: string) {
  const model = getGeminiChat()
  
  const config: any = {}
  if (systemInstruction) {
    config.systemInstruction = systemInstruction
  }
  
  return model.startChat(config)
}

// Error handling for Gemini API responses
export function handleGeminiError(error: any): Error {
  if (error.message?.includes('quota')) {
    return new Error('API quota exceeded. Please try again later.')
  }
  
  if (error.message?.includes('safety')) {
    return new Error('Content was blocked due to safety restrictions.')
  }
  
  if (error.message?.includes('timeout')) {
    return new Error('Request timed out. Please try again.')
  }
  
  return new Error(`AI service error: ${error.message || 'Unknown error'}`)
}