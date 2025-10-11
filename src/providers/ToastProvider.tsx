import React, { ReactNode } from 'react';
import ToastManager from 'toastify-react-native';

interface ToastProviderProps {
  children: ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastManager 
        position='top' 
        duration={1500} 
        theme='light'
      />
    </>
  );
};

export default ToastProvider;