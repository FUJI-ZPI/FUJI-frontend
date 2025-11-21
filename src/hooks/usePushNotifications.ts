import {useEffect, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import * as SecureStore from 'expo-secure-store';
import {Alert} from 'react-native';
import {Toast} from 'toastify-react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const usePushNotifications = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<string>('not_determined');

    useEffect(() => {
        // Funkcja do wysyłania tokena na backend
        const sendTokenToBackend = async (token: string) => {
            try {
                const accessToken = await SecureStore.getItemAsync('accessToken');

                if (!accessToken) {
                    console.log('No access token found, skipping FCM token registration');
                    return;
                }

                const response = await fetch(`${BACKEND_URL}/api/v1/user/fcm-token`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({token}),
                });

                if (response.ok) {
                    console.log('FCM token successfully sent to backend');
                    Toast.success('Push notifications enabled!');
                } else {
                    console.error('Failed to send FCM token to backend:', response.status);
                }
            } catch (error) {
                console.error('Error sending FCM token to backend:', error);
            }
        };

        // Funkcja do żądania uprawnień
        const requestUserPermission = async () => {
            try {
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    console.log('Authorization status:', authStatus);
                    setPermissionStatus('granted');

                    // Pobierz token FCM
                    const token = await messaging().getToken();
                    console.log('FCM Token:', token);
                    setFcmToken(token);

                    // Wyślij token na backend
                    await sendTokenToBackend(token);
                } else {
                    setPermissionStatus('denied');
                    console.log('Push notification permission denied');
                }
            } catch (error) {
                console.error('Error requesting push notification permission:', error);
                setPermissionStatus('error');
            }
        };

        // Funkcja do obsługi powiadomień na pierwszym planie (foreground)
        const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
            console.log('Foreground notification received:', remoteMessage);

            // Wyświetl powiadomienie jako Toast
            if (remoteMessage.notification) {
                Alert.alert(
                    remoteMessage.notification.title || 'Notification',
                    remoteMessage.notification.body || ''
                );
            }
        });

        // Obsługa kliknięcia w powiadomienie gdy app był w tle (background)
        const unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log(
                'Notification caused app to open from background state:',
                remoteMessage
            );
            // Tutaj możesz dodać nawigację do odpowiedniego ekranu
        });

        // Sprawdź czy aplikacja została otwarta z powiadomienia (killed state)
        messaging()
            .getInitialNotification()
            .then((remoteMessage) => {
                if (remoteMessage) {
                    console.log(
                        'Notification caused app to open from quit state:',
                        remoteMessage
                    );
                    // Tutaj możesz dodać nawigację do odpowiedniego ekranu
                }
            });

        // Żądaj uprawnień
        requestUserPermission();

        // Obsługa odświeżania tokena
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token) => {
            console.log('FCM Token refreshed:', token);
            setFcmToken(token);
            await sendTokenToBackend(token);
        });

        // Cleanup
        return () => {
            unsubscribeForeground();
            unsubscribeBackground();
            unsubscribeTokenRefresh();
        };
    }, []);

    return {
        fcmToken,
        permissionStatus,
    };
};

