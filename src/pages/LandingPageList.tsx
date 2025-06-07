import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useConfirmationModal } from '@/hooks/useModal';
import { landingPageStorage, LandingPageData } from '@/lib/landingPageStorage';
import { Plus } from 'lucide-react';

function LandingPageList() {
  const navigate = useNavigate();
  const [landingPages, setLandingPages] = useState<LandingPageData[]>([]);
  const [loading, setLoading] = useState(true);
  const confirmationModal = useConfirmationModal();

  useEffect(() => {
    try {
      const pages = landingPageStorage.getAllLandingPages();
      setLandingPages(pages.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (error) {
      console.error('Failed to load landing pages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = (pageId: string, pageName: string) => {
    confirmationModal.openConfirmation(
      'Delete Landing Page',
      `Are you sure you want to delete "${pageName}"? This action cannot be undone.`,
      () => {
        landingPageStorage.deleteLandingPage(pageId);
        setLandingPages(prev => prev.filter(page => page.id !== pageId));
      },
      'destructive'
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-white">Loading...</h2>
          <p className="text-gray-400">Fetching your landing pages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-white font-bold text-xl">
          Landify
        </div>
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
          <Button 
            onClick={() => navigate('/onboarding')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            Create New Page
          </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Landing Pages
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Manage and view all your created landing pages
          </p>
        </div>

        {landingPages.length === 0 ? (
          <div className="text-center">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Landing Pages Yet</h3>
              <p className="text-gray-300 mb-6">
                Create your first AI-powered landing page to get started
              </p>
              <Button 
                onClick={() => navigate('/onboarding')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                Create Your First Page
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingPages.map((page) => (
              <Card key={page.id} className="backdrop-blur-sm bg-white/5 border border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg">{page.businessData.name}</CardTitle>
                  <p className="text-sm text-gray-400">{page.businessData.type}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Location</p>
                    <p className="text-sm">{page.businessData.address}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Headline</p>
                    <p className="text-sm font-medium truncate">{page.content.headline}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Updated</p>
                    <p className="text-xs">{formatDate(page.updatedAt)}</p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Button 
                      onClick={() => navigate(`/page/${page.id}`)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                      size="sm"
                    >
                      View Page
                    </Button>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => navigate(`/editor/${page.id}`)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/20 text-black hover:bg-white/10 hover:text-white"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={() => handleDelete(page.id, page.businessData.name)}
                        variant="outline"
                        size="sm"
                        className="border-red-400/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 border-t border-white/10 pt-3">
                    ID: {page.id}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        open={confirmationModal.isOpen}
        onOpenChange={confirmationModal.closeConfirmation}
        title={confirmationModal.title}
        description={confirmationModal.description}
        confirmText="Delete"
        cancelText="Cancel"
        variant={confirmationModal.variant}
        onConfirm={confirmationModal.confirm}
      />
    </div>
  );
}

export default LandingPageList; 