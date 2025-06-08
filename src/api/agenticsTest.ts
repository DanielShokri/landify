import { BusinessData } from '@/types/business';
import { ContentGenerationRequest } from '@/types/content';
import { agenticsService } from './agenticsService';

// Test function to validate the refactored agents system
export async function testAgenticsSystem() {
  const mockBusinessData: BusinessData = {
    name: 'Delicious Pizza Place',
    type: 'Restaurant',
    address: '123 Main St, Downtown, NY 10001',
    phone: '+1 (555) 123-4567',
    rating: 4.5,
    description: 'Authentic Italian pizza made with fresh ingredients',
    website: 'https://deliciouspizza.com',
    email: 'info@deliciouspizza.com'
  };

  const mockRequest: ContentGenerationRequest = {
    businessData: mockBusinessData
  };

  try {
    console.log('🚀 Testing Agentics Service...');
    
    // Test basic generation
    const result = await agenticsService.generateLandingPageWithAgents(mockRequest);
    
    console.log('✅ Generation successful!');
    console.log('- HTML length:', result.htmlDocument?.length || 0);
    console.log('- Headline:', result.headline);
    console.log('- Value props:', result.valuePropositions?.length || 0);
    console.log('- Services:', result.services?.length || 0);
    
    // Test with progress tracking
    console.log('\n🔄 Testing with progress tracking...');
    
         return new Promise((resolve, reject) => {
       agenticsService.generateWithProgress(mockRequest).subscribe({
         next: (event) => {
           if ('type' in event && event.type === 'result') {
             console.log('✅ Progress generation complete!');
             console.log('- Final result received');
             resolve(event.data);
           } else if ('stage' in event) {
             console.log(`📊 ${event.stage}: ${event.progress}% - ${event.message}`);
           }
         },
         error: (error) => {
           console.error('❌ Progress generation failed:', error);
           reject(error);
         }
       });
     });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export for testing capabilities
export function getAgentCapabilities() {
  return agenticsService.getAgentCapabilities();
} 