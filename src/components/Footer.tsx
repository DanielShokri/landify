
interface FooterProps {
    variant?: 'landing' | 'app' | 'minimal';
    className?: string;
}

const Footer = ({ variant = 'app', className = '' }: FooterProps) => {
  const getFooterStyles = () => {
    switch (variant) {
    case 'landing':
      return 'text-center py-8 text-gray-400 border-t border-white/10 mt-auto';
    case 'minimal':
      return 'text-center py-8 text-gray-500 text-sm border-t border-gray-200 mt-auto';
    case 'app':
    default:
      return 'text-center py-8 text-gray-500 border-t border-gray-200 mt-auto';
    }
  };

  return (
    <footer className={`${getFooterStyles()} ${className}`}>
      <p>© 2024 Landify. AI-powered landing pages made simple.</p>
    </footer>
  );
};

export default Footer; 