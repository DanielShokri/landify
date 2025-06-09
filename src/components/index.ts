// Layout Components
export { default as Footer } from './Footer';
export { default as Header } from './Header';
export { default as Layout } from './Layout';
export { default as PageContainer } from './PageContainer';

// UI Components
export { default as FeatureCard } from './FeatureCard';
export { default as FloatingActionButton } from './FloatingActionButton';
export { default as GenerationProgress } from './GenerationProgress';
export { default as HTMLRenderer } from './HTMLRenderer';

// Page Components
export { default as CreatePage } from './create-page';
export { default as LandingPage } from './landing-page';

// Create Page Components (re-exported for convenience)
export { default as AIFeaturesInfo } from './create-page/AIFeaturesInfo';
export { default as AutocompleteDropdown } from './create-page/AutocompleteDropdown';
export { default as BusinessInformationForm } from './create-page/BusinessInformationForm';
export { default as BusinessSearchResult } from './create-page/BusinessSearchResult';
export { default as FormField } from './create-page/FormField';
export { default as ManualEntryForm } from './create-page/ManualEntryForm';
export { default as ProgressSteps } from './create-page/ProgressSteps';
export { default as SearchBusinessForm } from './create-page/SearchBusinessForm';
export { default as SearchInput } from './create-page/SearchInput';
export { default as SelectedBusinessCard } from './create-page/SelectedBusinessCard';

// Re-export UI components
export * from './ui/button';
export * from './ui/input';
export * from './ui/label';
export * from './ui/textarea';

