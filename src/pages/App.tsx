import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BusinessOnboarding from './BusinessOnboarding';
import GeneratedLandingPage from './GeneratedLandingPage';
import LandingPage from './LandingPage';
import LandingPageEditor from './LandingPageEditor';
import LandingPageList from './LandingPageList';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<BusinessOnboarding />} />
          <Route path="/pages" element={<LandingPageList />} />
          <Route path="/editor" element={<LandingPageEditor />} />
          <Route path="/editor/:pageId" element={<LandingPageEditor />} />
          <Route path="/page/:pageId" element={<GeneratedLandingPage />} />
          {/* Legacy routes for backwards compatibility */}
          <Route path="/final" element={<GeneratedLandingPage />} />
          {/* Add more routes for feature pages */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App; 