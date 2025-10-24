import React, {createContext, ReactNode} from 'react';
import ToastManager, {Toast} from 'toastify-react-native';

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastContextType {
    showToast: (options: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => void;
    toast: (options: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const showToast = (options: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => {
        const message = options.description ? `${options.title}\n${options.description}` : options.title;

        if (options.variant === 'error') {
            Toast.error(message);
        } else if (options.variant === 'success') {
            Toast.success(message);
        } else {
            Toast.info(message);
        }
    };

    const contextValue: ToastContextType = {
        showToast,
        toast: showToast,
    };

  return (
      <ToastContext.Provider value={contextValue}>
      {children}
      <ToastManager
          position='top'
          duration={2000}
        theme='light'
      />
      </ToastContext.Provider>
  );
};

export default ToastProvider;