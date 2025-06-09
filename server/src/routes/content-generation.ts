const expressContent = require('express');
const OpenAIContent = require('openai').default;

const contentRouterInstance = expressContent.Router();

// Lazy initialization of OpenAI client
let contentOpenaiClient: typeof OpenAIContent | null = null;

function getContentOpenAIClient(): typeof OpenAIContent {
  if (!contentOpenaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    contentOpenaiClient = new OpenAIContent({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return contentOpenaiClient;
}

// Utility functions
function parseJSONResponse(content: string): any {
  try {
    const cleanContent = content.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.warn('Failed to parse JSON response:', content);
    return {};
  }
}

function extractCity(address: string): string {
  if (!address) return 'Local Area';
  const parts = address.split(',');
  return parts.length > 1 ? parts[1].trim() : 'Local Area';
}

function generateDefaultTheme(businessData: any): any {
  const businessType = businessData.type?.toLowerCase() || '';
  
  if (businessType.includes('restaurant') || businessType.includes('food')) {
    return {
      primaryColor: '#d97706',
      secondaryColor: '#f59e0b',
      accentColor: '#92400e',
      backgroundColor: '#fef3c7',
      textColor: '#1f2937'
    };
  } else if (businessType.includes('health') || businessType.includes('medical')) {
    return {
      primaryColor: '#0ea5e9',
      secondaryColor: '#38bdf8',
      accentColor: '#0284c7',
      backgroundColor: '#e0f2fe',
      textColor: '#1f2937'
    };
  } else if (businessType.includes('tech') || businessType.includes('software')) {
    return {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      accentColor: '#4f46e5',
      backgroundColor: '#ede9fe',
      textColor: '#1f2937'
    };
  }
  
  // Default professional theme
  return {
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    accentColor: '#3b82f6',
    backgroundColor: '#f9fafb',
    textColor: '#1f2937'
  };
}

function generateDefaultLayout(): any {
  return {
    type: 'modern',
    sections: ['hero', 'services', 'about', 'contact'],
    navigation: 'horizontal',
    footer: 'simple'
  };
}

// Fast business analysis
async function generateBusinessAnalysis(businessData: any): Promise<any> {
  const prompt = `Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Description: ${businessData.description || 'N/A'}

Analyze the target market and competitive edge. Return JSON:
{
  "targetMarket": "primary customer type",
  "competitiveEdge": "main advantage",
  "emotionalTriggers": "key emotional appeal"
}`;

  const completion = await getContentOpenAIClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a business analyst. Return only JSON in English.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 300
  });

  return parseJSONResponse(completion.choices[0]?.message?.content || '{}');
}

// Generate content
async function generateContent(businessData: any): Promise<any> {
  const prompt = `Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Description: ${businessData.description || 'N/A'}

Create compelling content. Return JSON:
{
  "headline": "catchy main headline",
  "subheadline": "supporting description", 
  "valuePropositions": ["benefit 1", "benefit 2", "benefit 3"],
  "services": [{"name": "service name", "description": "brief description", "features": ["feature 1", "feature 2"]}],
  "callToAction": {"primary": {"text": "action text", "action": "contact"}, "secondary": {"text": "secondary text", "action": "info"}},
  "aboutSection": "brief about paragraph",
  "trustSignals": ["signal 1", "signal 2", "signal 3"]
}`;

      const completion = await getContentOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a marketing expert. Return only JSON in English.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 800
  });

  return parseJSONResponse(completion.choices[0]?.message?.content || '{}');
}

// Generate HTML
async function generateHTML(businessData: any, content: any): Promise<string> {
  const prompt = `Create a professional landing page HTML for ${businessData.name}.

Business: ${businessData.name} (${businessData.type})
Location: ${businessData.address}
Headline: ${content.headline || businessData.name}
Services: ${JSON.stringify(content.services || [])}

Requirements:
- Use TailwindCSS CDN
- Include hero, services, about, contact sections
- Mobile responsive
- Professional design
- Include contact info: ${businessData.phone || 'N/A'}, ${businessData.address || 'N/A'}

Return only the complete HTML document.`;

  try {
    const completion = await getContentOpenAIClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a web designer. Return only HTML in English.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9,
      max_tokens: 1500
    });

    return completion.choices[0]?.message?.content || generateFallbackHTML(businessData, content);
  } catch (error) {
    console.warn('HTML generation failed, using fallback:', error);
    return generateFallbackHTML(businessData, content);
  }
}

// Fallback HTML generator
function generateFallbackHTML(businessData: any, content: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessData.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <!-- Hero Section -->
    <header class="bg-blue-600 text-white py-20">
        <div class="container mx-auto px-4 text-center">
            <h1 class="text-4xl font-bold mb-4">${content.headline || businessData.name}</h1>
            <p class="text-xl mb-8">${content.subheadline || 'Professional services you can trust'}</p>
            <button class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
                ${content.callToAction?.primary?.text || 'Contact Us'}
            </button>
        </div>
    </header>

    <!-- Services Section -->
    <section class="py-16">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div class="grid md:grid-cols-3 gap-8">
                ${(content.services || []).map((service: any) => `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold mb-3">${service.name}</h3>
                    <p class="text-gray-600">${service.description}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-8">About Us</h2>
            <p class="text-lg text-center max-w-3xl mx-auto">
                ${content.aboutSection || `${businessData.name} is dedicated to providing exceptional service to our community.`}
            </p>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 bg-gray-100">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold mb-8">Contact Us</h2>
            <div class="max-w-md mx-auto">
                ${businessData.phone ? `<p class="mb-2"><strong>Phone:</strong> ${businessData.phone}</p>` : ''}
                ${businessData.address ? `<p class="mb-2"><strong>Address:</strong> ${businessData.address}</p>` : ''}
                ${businessData.email ? `<p class="mb-2"><strong>Email:</strong> ${businessData.email}</p>` : ''}
            </div>
        </div>
    </section>
</body>
</html>`;
}

// POST /api/content-generation/generate - Main generation endpoint
contentRouterInstance.post('/generate', async (req: any, res: any): Promise<any> => {
  try {
    const { businessData } = req.body;

    if (!businessData || !businessData.name) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Business data with name is required'
      });
    }

    // Run analysis and content generation in parallel
    const [, contentData] = await Promise.all([
      generateBusinessAnalysis(businessData),
      generateContent(businessData)
    ]);

    // Generate HTML based on the content
    const htmlDocument = await generateHTML(businessData, contentData);

    const result = {
      htmlDocument,
      layout: generateDefaultLayout(),
      headline: contentData.headline,
      subheadline: contentData.subheadline,
      valuePropositions: contentData.valuePropositions,
      services: contentData.services,
      callToAction: contentData.callToAction,
      aboutSection: contentData.aboutSection,
      contactInfo: {
        phone: businessData.phone || '',
        address: businessData.address || '',
        email: businessData.email || '',
        website: businessData.website || ''
      },
      theme: generateDefaultTheme(businessData),
      trustSignals: contentData.trustSignals || ['Licensed & Insured', 'Local Experts', '100% Satisfaction Guarantee'],
      locationHighlights: {
        neighborhood: extractCity(businessData.address),
        accessibility: 'Easy Access',
        parking: 'Parking Available',
        nearbyLandmarks: 'Conveniently Located'
      },
      businessHours: {
        schedule: typeof businessData.hours === 'string' 
          ? businessData.hours 
          : 'Monday-Friday: 9:00 AM - 5:00 PM, Saturday-Sunday: Closed',
        specialHours: 'Holiday hours may vary',
        availability: 'Available during business hours'
      }
    };

    res.json(result);

  } catch (error: any) {
    console.error('Content generation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate content'
    });
  }
});

// GET /api/content-generation/capabilities - Get agent capabilities
contentRouterInstance.get('/capabilities', (req: any, res: any) => {
  res.json({
    name: 'Fast Content Generation Service',
    version: '1.0.0',
    capabilities: [
      'Business Analysis',
      'Content Generation',
      'HTML Generation',
      'Theme Customization',
      'SEO Optimization'
    ],
    speed: 'Optimized for fast parallel processing',
    features: [
      'Parallel content generation',
      'Template-based HTML',
      'Professional themes',
      'Mobile-responsive design'
    ]
  });
});

module.exports = { contentRouter: contentRouterInstance }; 