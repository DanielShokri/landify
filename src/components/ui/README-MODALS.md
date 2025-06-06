# Modal System Documentation

This project includes a comprehensive modal system with multiple components and hooks for different use cases.

## Components Available

### 1. Dialog Components (`dialog.tsx`)
Low-level Radix UI dialog primitives. These are the building blocks for all other modals.

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
```

### 2. Basic Modal (`modal.tsx`)
A general-purpose modal wrapper with light and dark theme variants.

```tsx
import { Modal, DarkModal } from '@/components/ui/modal';

// Light theme modal
<Modal open={isOpen} onClose={closeModal} title="My Modal">
  <p>Modal content goes here</p>
</Modal>

// Dark theme modal (matches app's dark design)
<DarkModal open={isOpen} onClose={closeModal} title="My Modal">
  <p>Modal content goes here</p>
</DarkModal>
```

### 3. Confirmation Modal (`confirmation-modal.tsx`)
Specialized modal for confirmations, warnings, and destructive actions.

```tsx
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

<ConfirmationModal
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Item"
  description="Are you sure you want to delete this item?"
  variant="destructive" // 'destructive' | 'warning' | 'default'
  onConfirm={handleDelete}
/>
```

## Hooks Available

### 1. useModal Hook
Basic modal state management.

```tsx
import { useModal } from '@/hooks/useModal';

function MyComponent() {
  const modal = useModal();
  
  return (
    <>
      <Button onClick={modal.openModal}>Open Modal</Button>
      <Modal open={modal.isOpen} onClose={modal.closeModal}>
        Content here
      </Modal>
    </>
  );
}
```

### 2. useConfirmationModal Hook
Advanced hook for confirmation dialogs with cleaner API.

```tsx
import { useConfirmationModal } from '@/hooks/useModal';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

function MyComponent() {
  const confirmationModal = useConfirmationModal();
  
  const handleDelete = () => {
    confirmationModal.openConfirmation(
      'Delete Item',
      'This action cannot be undone.',
      () => {
        // Actual delete logic here
        console.log('Deleted!');
      },
      'destructive'
    );
  };

  return (
    <>
      <Button onClick={handleDelete}>Delete</Button>
      
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
```

## Modal Props

### Modal & DarkModal Props
- `open: boolean` - Whether modal is open
- `onClose: () => void` - Function to close modal
- `title?: string` - Optional title in header
- `children: ReactNode` - Modal content
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'` - Max width
- `showCloseButton?: boolean` - Show/hide close button (default: true)
- `className?: string` - Additional CSS classes

### ConfirmationModal Props
- `open: boolean` - Whether modal is open
- `onOpenChange: (open: boolean) => void` - Handle open state changes
- `title: string` - Modal title
- `description: string` - Modal description/message
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `onConfirm: () => void` - Confirmation callback
- `onCancel?: () => void` - Optional cancel callback
- `variant?: 'destructive' | 'warning' | 'default'` - Visual variant
- `isLoading?: boolean` - Show loading state

## Examples

### Simple Information Modal
```tsx
const modal = useModal();

<Modal open={modal.isOpen} onClose={modal.closeModal} title="Info">
  <p>This is some information.</p>
</Modal>
```

### Form Modal
```tsx
const modal = useModal();

<Modal open={modal.isOpen} onClose={modal.closeModal} title="Edit Profile">
  <form onSubmit={handleSubmit}>
    <Input placeholder="Name" />
    <Button type="submit">Save</Button>
  </form>
</Modal>
```

### Delete Confirmation
```tsx
const confirmationModal = useConfirmationModal();

const handleDelete = () => {
  confirmationModal.openConfirmation(
    'Delete Item',
    'This action cannot be undone.',
    () => performDelete(),
    'destructive'
  );
};
```

### Dark Theme Modal (for dark pages)
```tsx
<DarkModal open={isOpen} onClose={closeModal} maxWidth="2xl">
  <div className="text-white">
    <h3>Dark themed content</h3>
  </div>
</DarkModal>
```

## Best Practices

1. **Use ConfirmationModal for destructive actions** - Always confirm deletes, permanent changes
2. **Choose appropriate variant** - `destructive` for deletes, `warning` for risky actions
3. **Use DarkModal on dark-themed pages** - Maintains visual consistency
4. **Include descriptive titles and messages** - Help users understand the action
5. **Handle loading states** - Set `isLoading` during async operations
6. **Provide escape routes** - Always allow users to cancel or close modals

## Integration Examples

See `src/components/examples/ModalExamples.tsx` for complete working examples of all modal types. 