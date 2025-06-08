import { useState } from 'react';

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    setIsOpen
  };
}

// Specialized hook for confirmation modals
export function useConfirmationModal() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (() => void) | null;
    variant?: 'destructive' | 'warning' | 'default';
      }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: null,
        variant: 'default'
      });

  const openConfirmation = (
    title: string,
    description: string,
    onConfirm: () => void,
    variant: 'destructive' | 'warning' | 'default' = 'default'
  ) => {
    setState({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant
    });
  };

  const closeConfirmation = () => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      onConfirm: null
    }));
  };

  const confirm = () => {
    if (state.onConfirm) {
      state.onConfirm();
    }
    closeConfirmation();
  };

  return {
    ...state,
    openConfirmation,
    closeConfirmation,
    confirm
  };
} 