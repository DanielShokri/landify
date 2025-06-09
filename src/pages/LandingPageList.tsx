import { Layout, PageContainer } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useConfirmationModal } from '@/hooks/useModal';
import type { LandingPageData } from '@/lib/landingPageStorage';
import { landingPageStorage } from '@/lib/landingPageStorage';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <Layout variant="landing" showFooter={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 text-white">Loading...</h2>
            <p className="text-gray-400">Fetching your landing pages</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="landing" showFooter={false}>
      <PageContainer
        maxWidth="7xl"
        centerContent
        className="py-20"
        title="Your Landing Pages"
        subtitle="Manage and view all your created landing pages"
      >
        {landingPages.length === 0 ? (
          <EmptyState onCreateNew={() => navigate('/onboarding')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landingPages.map((page) => (
              <LandingPageCard
                key={page.id}
                page={page}
                onView={() => navigate(`/page/${page.id}`)}
                onDelete={() => handleDelete(page.id, page.businessData.name)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <ConfirmationModal
        open={confirmationModal.isOpen}
        onOpenChange={confirmationModal.closeConfirmation}
        title={confirmationModal.title}
        description={confirmationModal.description}
        confirmText="Delete"
        cancelText="Cancel"
        variant={confirmationModal.variant || 'default'}
        onConfirm={confirmationModal.confirm}
      />
    </Layout>
  );
}

// Empty State Component
function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
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
          onClick={onCreateNew}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
        >
          Create Your First Page
        </Button>
      </div>
    </div>
  );
}

// Landing Page Card Component
function LandingPageCard({
  page,
  onView,
  onDelete,
  formatDate
}: {
  page: LandingPageData;
  onView: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
}) {
  return (
    <Card className="backdrop-blur-sm bg-white/5 border border-white/10 text-white">
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
            onClick={onView}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            size="sm"
          >
            View Page
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="w-full border-red-400/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            Delete
          </Button>
        </div>

        <div className="text-xs text-gray-500 border-t border-white/10 pt-3">
          ID: {page.id}
        </div>
      </CardContent>
    </Card>
  );
}

export default LandingPageList; 