import { generateStructuredOutput, generateWithSearch, handleGeminiError } from './gemini.js';
// Stage 1: Image Processing
export async function processImage(imageData, mimeType = 'image/jpeg') {
    try {
        // Validate base64 format
        if (!imageData || !imageData.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
            throw new Error('Invalid base64 image data');
        }
        // Calculate approximate size
        const sizeMB = (imageData.length * 0.75) / (1024 * 1024); // Rough base64 to bytes conversion
        // Validate size (max 10MB)
        if (sizeMB > 10) {
            throw new Error('Image size exceeds 10MB limit');
        }
        return {
            validated: true,
            size_mb: Math.round(sizeMB * 100) / 100,
            dimensions: { width: 0, height: 0 }, // Would require image decoding for actual dimensions
            base64_data: imageData
        };
    }
    catch (error) {
        throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
// Stage 2: Product Identification Agent (Gemini Vision)
export async function identifyProduct(imageData) {
    const prompt = `
Analyze this pet food package image and identify the product details.

Extract the following information:
- Brand name (exact text from package)
- Product name (full product name)
- Size/weight (if visible on package)
- Food type: classify as "kibble", "wet", or "treat"
- Species: classify as "cat" or "dog"

Be precise and only extract information that is clearly visible on the package.
If something is unclear, use your best judgment based on typical pet food packaging.
`;
    const schema = {
        type: 'object',
        properties: {
            brand: {
                type: 'string',
                description: 'Brand name as shown on package'
            },
            product_name: {
                type: 'string',
                description: 'Full product name'
            },
            size: {
                type: 'string',
                description: 'Package size or weight'
            },
            food_type: {
                type: 'string',
                enum: ['kibble', 'wet', 'treat'],
                description: 'Type of pet food'
            },
            species: {
                type: 'string',
                enum: ['cat', 'dog'],
                description: 'Target pet species'
            }
        },
        required: ['brand', 'product_name', 'size', 'food_type', 'species']
    };
    try {
        const result = await generateStructuredOutput(prompt, schema, { temperature: 0.3 } // Low temperature for consistent identification
        );
        return result;
    }
    catch (error) {
        throw handleGeminiError(error);
    }
}
// Stage 3: Product Data Retrieval & Online Search Agent
export async function retrieveProductData(identification) {
    const searchQuery = `
Search for comprehensive information about "${identification.brand} ${identification.product_name}" pet food.

Find and extract:
1. Complete ingredients list (in order of quantity)
2. Guaranteed Analysis with exact percentages:
   - Crude Protein (min %)
   - Crude Fat (min %)
   - Crude Fiber (max %)
   - Moisture (max %)
   - Ash content (if available)
   - Phosphorus (if available)
3. User reviews summary in Persian language (positive and negative feedback)
4. Any recall information or safety alerts

Focus on official product pages, retailer sites, and verified reviews.
Return detailed, accurate information only from reliable sources.
`;
    try {
        const result = await generateWithSearch(searchQuery);
        // Parse the structured response
        const extractPrompt = `
Based on this search information about ${identification.brand} ${identification.product_name}:

${result.text}

Extract and structure the data in the following format:
`;
        const schema = {
            type: 'object',
            properties: {
                ingredients: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Complete ingredients list in order'
                },
                guaranteed_analysis: {
                    type: 'object',
                    properties: {
                        protein: { type: 'number', description: 'Crude Protein minimum %' },
                        fat: { type: 'number', description: 'Crude Fat minimum %' },
                        fiber: { type: 'number', description: 'Crude Fiber maximum %' },
                        moisture: { type: 'number', description: 'Moisture maximum %' },
                        ash: { type: 'number', description: 'Ash content %' },
                        phosphorus: { type: 'number', description: 'Phosphorus %' }
                    },
                    required: ['protein', 'fat', 'fiber', 'moisture']
                },
                user_reviews_summary: {
                    type: 'string',
                    description: 'Summary of user reviews in Persian language'
                },
                recall_information: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Any recall or safety information'
                }
            },
            required: ['ingredients', 'guaranteed_analysis', 'user_reviews_summary', 'recall_information']
        };
        const structuredData = await generateStructuredOutput(extractPrompt, schema, { temperature: 0.2 });
        return structuredData;
    }
    catch (error) {
        throw handleGeminiError(error);
    }
}
// Stage 4: Nutrition Analysis Agent
export async function analyzeNutrition(identification, productData, petContext) {
    const analysisPrompt = `
Perform a comprehensive nutritional analysis for this pet food:

Product: ${identification.brand} ${identification.product_name}
Food Type: ${identification.food_type}
Target Species: ${identification.species}

Ingredients: ${productData.ingredients.join(', ')}

Guaranteed Analysis:
- Protein: ${productData.guaranteed_analysis.protein}%
- Fat: ${productData.guaranteed_analysis.fat}%
- Fiber: ${productData.guaranteed_analysis.fiber}%
- Moisture: ${productData.guaranteed_analysis.moisture}%

Pet Profile:
- Species: ${petContext.species}
- Age: ${petContext.age || 'Unknown'}
- Weight: ${petContext.weight || 'Unknown'}
- Health Conditions: ${petContext.health_conditions?.join(', ') || 'None'}
- Dietary Restrictions: ${petContext.dietary_restrictions?.join(', ') || 'None'}

Provide analysis in Persian language with:
1. Compatibility score (1-100) based on pet's specific needs
2. Buy/No-buy verdict
3. 3 key reasons for the verdict
4. Good ingredients with explanations
5. Bad/concerning ingredients with explanations

Consider:
- Species-specific nutritional needs
- Health conditions (kidney, urinary, allergies, etc.)
- Life stage appropriateness
- Ingredient quality and safety
- Nutritional balance
`;
    const schema = {
        type: 'object',
        properties: {
            score: {
                type: 'number',
                description: 'Compatibility score from 1-100'
            },
            verdict: {
                type: 'string',
                enum: ['buy', 'no-buy'],
                description: 'Final recommendation'
            },
            reasons: {
                type: 'array',
                items: { type: 'string' },
                description: '3 key reasons in Persian'
            },
            goodIngredients: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Ingredient name in English' },
                        persianName: { type: 'string', description: 'Ingredient name in Persian' },
                        reason: { type: 'string', description: 'Why this ingredient is good in Persian' }
                    },
                    required: ['name', 'persianName', 'reason']
                }
            },
            badIngredients: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Ingredient name in English' },
                        persianName: { type: 'string', description: 'Ingredient name in Persian' },
                        reason: { type: 'string', description: 'Why this ingredient is concerning in Persian' },
                        severity: {
                            type: 'string',
                            enum: ['low', 'medium', 'high'],
                            description: 'Severity level of concern'
                        }
                    },
                    required: ['name', 'persianName', 'reason', 'severity']
                }
            }
        },
        required: ['score', 'verdict', 'reasons', 'goodIngredients', 'badIngredients']
    };
    try {
        const result = await generateStructuredOutput(analysisPrompt, schema, { temperature: 0.5 });
        // Validate score range
        if (result.score < 1 || result.score > 100) {
            result.score = Math.max(1, Math.min(100, result.score));
        }
        return result;
    }
    catch (error) {
        throw handleGeminiError(error);
    }
}
// Stage 5: MLP Output & Delight Layer
export async function createDelightOutput(nutritionAnalysis, petName) {
    const delightPrompt = `
Create a delightful user experience output based on this nutrition analysis:

Score: ${nutritionAnalysis.score}/100
Verdict: ${nutritionAnalysis.verdict}
Pet Name: ${petName || 'your pet'}

Generate:
1. Mascot mood based on score:
   - 80-100: "happy" 
   - 50-79: "suspicious"
   - 1-49: "sad"

2. Badge color:
   - Green for good scores (80+)
   - Yellow for medium scores (50-79) 
   - Red for low scores (1-49)

3. Verdict text in Persian with appropriate emojis
4. Personalized message for the pet owner in Persian

Make it engaging, friendly, and informative while maintaining the scientific accuracy.
`;
    const schema = {
        type: 'object',
        properties: {
            mascot_mood: {
                type: 'string',
                enum: ['happy', 'suspicious', 'sad'],
                description: 'Mascot mood based on score'
            },
            badge_color: {
                type: 'string',
                description: 'Color code for the score badge'
            },
            verdict_text: {
                type: 'string',
                description: 'Verdict message in Persian with emojis'
            },
            personalized_message: {
                type: 'string',
                description: 'Personalized message for pet owner in Persian'
            }
        },
        required: ['mascot_mood', 'badge_color', 'verdict_text', 'personalized_message']
    };
    try {
        const result = await generateStructuredOutput(delightPrompt, schema, { temperature: 0.8 } // Higher creativity for engaging content
        );
        return result;
    }
    catch (error) {
        throw handleGeminiError(error);
    }
}
// Complete AI Pipeline Orchestrator
export async function runAIPipeline(input) {
    const startTime = Date.now();
    const results = [];
    try {
        // Stage 1: Image Processing (already done in input)
        const processedImage = input.image;
        // Stage 2: Product Identification
        console.log('🔍 Stage 2: Product Identification...');
        const identificationStart = Date.now();
        const identification = await identifyProduct(processedImage.base64_data);
        results.push({
            stage: 'identification',
            success: true,
            result: identification,
            processing_time_ms: Date.now() - identificationStart
        });
        // Stage 3: Product Data Retrieval
        console.log('🌐 Stage 3: Product Data Retrieval...');
        const dataRetrievalStart = Date.now();
        const productData = await retrieveProductData(identification);
        results.push({
            stage: 'data_retrieval',
            success: true,
            result: productData,
            processing_time_ms: Date.now() - dataRetrievalStart
        });
        // Stage 4: Nutrition Analysis
        console.log('🧪 Stage 4: Nutrition Analysis...');
        const nutritionStart = Date.now();
        const nutritionAnalysis = await analyzeNutrition(identification, productData, input.pet_context);
        results.push({
            stage: 'nutrition_analysis',
            success: true,
            result: nutritionAnalysis,
            processing_time_ms: Date.now() - nutritionStart
        });
        // Stage 5: Delight Output
        console.log('✨ Stage 5: Delight Output...');
        const delightStart = Date.now();
        const delightOutput = await createDelightOutput(nutritionAnalysis);
        results.push({
            stage: 'delight_output',
            success: true,
            result: delightOutput,
            processing_time_ms: Date.now() - delightStart
        });
        const totalTime = Date.now() - startTime;
        console.log(`✅ AI Pipeline completed in ${totalTime}ms`);
        return {
            identification,
            product_data: productData,
            nutrition_analysis: nutritionAnalysis,
            delight_output: delightOutput,
            timestamp: new Date().toISOString(),
            processing_time_ms: totalTime
        };
    }
    catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`❌ AI Pipeline failed after ${totalTime}ms:`, error);
        throw new Error(`AI Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=ai-pipeline.js.map