// src/providers/ModalProvider.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

const modalAnimationStyles = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes modalScaleIn {
    from {
      opacity: 0;
      transform: scale(0.93);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes modalFadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes modalScaleOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.93);
    }
  }

  .modal-overlay-enter {
    animation: modalFadeIn 0.2s ease-out forwards;
  }

  .modal-overlay-exit {
    animation: modalFadeOut 0.2s ease-in forwards;
  }

  .modal-content-enter {
    animation: modalScaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  .modal-content-exit {
    animation: modalScaleOut 0.2s ease-in forwards;
  }
`;

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    content: null,
    data: {},
    usePortal: false,
    onClose: null,
  });

  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);
  const modalIdRef = useRef(0);

  const openModal = useCallback((type, content, data = {}, usePortal = false, onClose = null) => {
    // Cancel any pending close timeout to prevent race condition
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    // Increment modal ID to track instances
    modalIdRef.current += 1;
    
    setModalState({
      isOpen: true,
      type,
      content,
      data,
      usePortal,
      onClose,
    });
    setIsClosing(false);
  }, []);

  const closeModal = useCallback(() => {
    const closingModalId = modalIdRef.current;
    setIsClosing(true);
    
    // Cancel any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      // Invoke onClose callback first (may trigger new modal)
      if (modalState.onClose) {
        modalState.onClose();
      }
      
      // Only clear state if modal hasn't changed (no new modal opened in callback)
      if (modalIdRef.current === closingModalId) {
        setModalState({
          isOpen: false,
          type: null,
          content: null,
          data: {},
          usePortal: false,
          onClose: null,
        });
        setIsClosing(false);
      }
      closeTimeoutRef.current = null;
    }, 250); // Match animation duration
  }, [modalState]);

  const replaceModal = useCallback((type, content, data = {}, usePortal = false, onClose = null) => {
    // Cancel any pending close timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    setModalState({
      isOpen: true,
      type,
      content,
      data,
      usePortal,
      onClose,
    });
    setIsClosing(false);
  }, []);

  const contextValue = {
    isOpen: modalState.isOpen,
    type: modalState.type,
    data: modalState.data,
    openModal,
    closeModal,
    replaceModal,
  };

  const renderModalContent = () => {
    if (!modalState.isOpen || !modalState.content) return null;

    const ModalContent = modalState.content;
    const overlayClass = isClosing ? 'modal-overlay-exit' : 'modal-overlay-enter';
    const contentClass = isClosing ? 'modal-content-exit' : 'modal-content-enter';

    const modalElement = (
      <div
        className={overlayClass}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        <div className={contentClass}>
          <ModalContent {...modalState.data} onClose={closeModal} />
        </div>
      </div>
    );

    // Use portal for heavy modals, inline for light modals
    if (modalState.usePortal) {
      const portalRoot = document.getElementById('modal-root');
      if (portalRoot) {
        return createPortal(modalElement, portalRoot);
      }
    }

    return modalElement;
  };

  return (
    <ModalContext.Provider value={contextValue}>
      <style>{modalAnimationStyles}</style>
      {children}
      {renderModalContent()}
    </ModalContext.Provider>
  );
}

export function ModalRoot() {
  return <div id="modal-root" />;
}
