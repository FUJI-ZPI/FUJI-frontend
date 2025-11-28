import React, {createContext, ReactNode} from 'react';
import {StyleSheet} from 'react-native';
import Toast, {BaseToast, ErrorToast, InfoToast} from 'react-native-toast-message';

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastContextType {
    showToast: (options: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => void;
    toast: (options: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Niestandardowa konfiguracja dla Toast z większą czcionką
const toastConfig = {
    success: (props: any) => (
        <BaseToast
            {...props}
            style={styles.successToast}
            contentContainerStyle={styles.contentContainer}
            text1Style={styles.text1}
            text2Style={styles.text2}
            text1NumberOfLines={2}
            text2NumberOfLines={2}
        />
    ),
    error: (props: any) => (
        <ErrorToast
            {...props}
            style={styles.errorToast}
            contentContainerStyle={styles.contentContainer}
            text1Style={styles.text1}
            text2Style={styles.text2}
            text1NumberOfLines={2}
            text2NumberOfLines={2}
        />
    ),
    info: (props: any) => (
        <InfoToast
            {...props}
            style={styles.infoToast}
            contentContainerStyle={styles.contentContainer}
            text1Style={styles.text1}
            text2Style={styles.text2}
            text1NumberOfLines={2}
            text2NumberOfLines={2}
        />
    ),
};

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const showToast = (options: { title: string; description?: string; variant?: 'success' | 'error' | 'info' }) => {
        Toast.show({
            type: options.variant === 'error' ? 'error' : options.variant === 'success' ? 'success' : 'info',
            text1: options.title,
            text2: options.description,
            position: 'top',
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 60,
        });
    };

    const contextValue: ToastContextType = {
        showToast,
        toast: showToast,
    };

  return (
      <ToastContext.Provider value={contextValue}>
      {children}
          <Toast config={toastConfig}/>
      </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
    toastContainer: {
        borderLeftWidth: 5,
        height: undefined,
        minHeight: 70,
        paddingVertical: 12,
    },
    contentContainer: {
        paddingHorizontal: 15,
    },
    text1: {
        fontSize: 17,
        fontWeight: '600',
        lineHeight: 22,
    },
    text2: {
        fontSize: 15,
        lineHeight: 20,
        marginTop: 4,
    },
    successToast: {
        borderLeftColor: '#33e155',
        borderLeftWidth: 5,
        height: undefined,
        minHeight: 70,
        paddingVertical: 12,
    },
    errorToast: {
        borderLeftColor: '#fe2701',
        borderLeftWidth: 5,
        height: undefined,
        minHeight: 70,
        paddingVertical: 12,
    },
    infoToast: {
        borderLeftColor: '#87CEEB',
        borderLeftWidth: 5,
        height: undefined,
        minHeight: 70,
        paddingVertical: 12,
    },
});

export default ToastProvider;