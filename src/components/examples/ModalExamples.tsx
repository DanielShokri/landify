import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, DarkModal } from '@/components/ui/modal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useModal, useConfirmationModal } from '@/hooks/useModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Example: Simple Info Modal
export function InfoModalExample() {
  const modal = useModal();

  return (
    <>
      <Button onClick={modal.openModal}>Open Info Modal</Button>
      
      <Modal
        open={modal.isOpen}
        onClose={modal.closeModal}
        title="Information"
      >
        <p>This is a simple informational modal using the light theme.</p>
        <p>It's great for displaying content, forms, or any other UI elements.</p>
      </Modal>
    </>
  );
}

// Example: Dark Theme Modal
export function DarkModalExample() {
  const modal = useModal();

  return (
    <>
      <Button onClick={modal.openModal} variant="outline">
        Open Dark Modal
      </Button>
      
      <DarkModal
        open={modal.isOpen}
        onClose={modal.closeModal}
        title="Dark Theme Modal"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-white">
          <p>This modal uses the dark theme that matches your app's design.</p>
          <p>Perfect for maintaining consistency with dark-themed pages.</p>
          
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Consistent with app's dark theme</li>
              <li>Multiple size options</li>
              <li>Backdrop blur effect</li>
              <li>Smooth animations</li>
            </ul>
          </div>
        </div>
      </DarkModal>
    </>
  );
}

// Example: Form Modal
export function FormModalExample() {
  const modal = useModal();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    modal.closeModal();
    setFormData({ name: '', email: '' });
  };

  return (
    <>
      <Button onClick={modal.openModal} variant="outline">
        Open Form Modal
      </Button>
      
      <Modal
        open={modal.isOpen}
        onClose={modal.closeModal}
        title="Contact Form"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Submit
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={modal.closeModal}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// Example: Confirmation Modal with Hook
export function ConfirmationModalExample() {
  const confirmationModal = useConfirmationModal();

  const handleDelete = () => {
    confirmationModal.openConfirmation(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      () => {
        console.log('Item deleted!');
        // Perform deletion logic here
      },
      'destructive'
    );
  };

  const handleWarning = () => {
    confirmationModal.openConfirmation(
      'Warning',
      'This action will make changes to your data. Do you want to continue?',
      () => {
        console.log('Action confirmed!');
        // Perform action logic here
      },
      'warning'
    );
  };

  return (
    <>
      <div className="space-x-2">
        <Button onClick={handleDelete} variant="destructive">
          Delete Item
        </Button>
        <Button onClick={handleWarning} variant="outline">
          Warning Action
        </Button>
      </div>
      
      <ConfirmationModal
        open={confirmationModal.isOpen}
        onOpenChange={confirmationModal.closeConfirmation}
        title={confirmationModal.title}
        description={confirmationModal.description}
        variant={confirmationModal.variant}
        onConfirm={confirmationModal.confirm}
      />
    </>
  );
}

// Example: All Modal Types Demo
export function ModalExamplesDemo() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Modal Examples</h2>
        <p className="text-gray-600 mb-6">
          Demonstrations of different modal types available in the application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Modals</h3>
          <InfoModalExample />
          <DarkModalExample />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interactive Modals</h3>
          <FormModalExample />
          <ConfirmationModalExample />
        </div>
      </div>
    </div>
  );
} 