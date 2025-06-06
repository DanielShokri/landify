import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ThemeProvider from '../components/ui/ThemeProvider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import BusinessOnboarding from './BusinessOnboarding';
import ContentGeneration from './ContentGeneration';
import LandingPageEditor from './LandingPageEditor';
import GeneratedLandingPage from './GeneratedLandingPage';
import LandingPageList from './LandingPageList';
// import { Container } from '../components/ui/container'; // Example shadcn/ui import

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<BusinessOnboarding />} />
            <Route path="/generate" element={<ContentGeneration />} />
            <Route path="/pages" element={<LandingPageList />} />
            <Route path="/editor" element={<LandingPageEditor />} />
            <Route path="/editor/:pageId" element={<LandingPageEditor />} />
            <Route path="/page/:pageId" element={<GeneratedLandingPage />} />
            {/* Legacy routes for backwards compatibility */}
            <Route path="/final" element={<GeneratedLandingPage />} />
            {/* Add more routes for feature pages */}
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 