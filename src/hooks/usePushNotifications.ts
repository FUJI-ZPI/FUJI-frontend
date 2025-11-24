import {useEffect, useState} from 'react';
import * as SecureStore from 'expo-secure-store';
import {Alert} from 'react-native';
import {Toast} from 'toastify-react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const usePushNotifications = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<string>('not_determined');
    const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);

    useEffect(() => {
        // Sprawdź czy Firebase jest dostępny
        let messaging: any;
        try {
            messaging = require('@react-native-firebase/messaging').default;
            setIsFirebaseAvailable(true);
        } catch (error) {
            console.log('Firebase messaging not available - skipping push notifications setup');
            setIsFirebaseAvailable(false);
            return; // Wyjdź z hooka jeśli Firebase nie jest dostępny
        }

        // Funkcja do wysyłania tokena na backend
        const sendTokenToBackend = async (token: string) => {
            try {
                const accessToken = await SecureStore.getItemAsync('accessToken');
                console.log("access token", accessToken);

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
                    body: JSON.stringify({fcmToken: token}),
                });
                console.log("FCm payload", JSON.stringify({fcmToken: token}),)

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

        // Funkcja do żądania uprawnień z timeoutem
        const requestUserPermission = async () => {
            try {
                // Timeout aby nie blokować UI
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Firebase initialization timeout')), 10000)
                );

                const permissionPromise = messaging().requestPermission();
                console.log("permission permission", permissionPromise);

                const authStatus = await Promise.race([permissionPromise, timeoutPromise]) as number;
                console.log("auth status", authStatus);

                const enabled =
                    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

                if (enabled) {
                    console.log('Authorization status:', authStatus);
                    setPermissionStatus('granted');

                    // Pobierz token FCM z timeoutem
                    const tokenPromise = messaging().getToken();
                    const tokenTimeout = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Token fetch timeout')), 10000)
                    );

                    const token = await Promise.race([tokenPromise, tokenTimeout]) as string;
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
                // Nie blokuj aplikacji - po prostu loguj błąd
            }
        };

        let unsubscribeForeground: (() => void) | undefined;
        let unsubscribeBackground: (() => void) | undefined;
        let unsubscribeTokenRefresh: (() => void) | undefined;

        // Uruchom asynchronicznie aby nie blokować renderowania
        const initializeFirebase = async () => {
            try {
                // Funkcja do obsługi powiadomień na pierwszym planie (foreground)
                unsubscribeForeground = messaging().onMessage(async (remoteMessage: any) => {
                    console.log('Foreground notification received:', remoteMessage);

                    // Wyświetl powiadomienie jako Alert
                    if (remoteMessage.notification) {
                        Alert.alert(
                            remoteMessage.notification.title || 'Notification',
                            remoteMessage.notification.body || ''
                        );
                    }
                });

                // Obsługa kliknięcia w powiadomienie gdy app był w tle (background)
                unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage: any) => {
                    console.log(
                        'Notification caused app to open from background state:',
                        remoteMessage
                    );
                    // Tutaj możesz dodać nawigację do odpowiedniego ekranu
                });

                // Sprawdź czy aplikacja została otwarta z powiadomienia (killed state)
                messaging()
                    .getInitialNotification()
                    .then((remoteMessage: any) => {
                        if (remoteMessage) {
                            console.log(
                                'Notification caused app to open from quit state:',
                                remoteMessage
                            );
                            // Tutaj możesz dodać nawigację do odpowiedniego ekranu
                        }
                    })
                    .catch((error: any) => {
                        console.log('Error getting initial notification:', error);
                    });

                // Żądaj uprawnień
                await requestUserPermission();

                // Obsługa odświeżania tokena
                unsubscribeTokenRefresh = messaging().onTokenRefresh(async (token: string) => {
                    console.log('FCM Token refreshed:', token);
                    setFcmToken(token);
                    await sendTokenToBackend(token);
                });
            } catch (error) {
                console.error('Error initializing Firebase messaging:', error);
            }
        };

        // Uruchom po 1 sekundzie aby nie blokować initial render
        const timer = setTimeout(() => {
            initializeFirebase();
        }, 1000);

        // Cleanup
        return () => {
            clearTimeout(timer);
            if (unsubscribeForeground) unsubscribeForeground();
            if (unsubscribeBackground) unsubscribeBackground();
            if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
        };
    }, []);

    return {
        fcmToken,
        permissionStatus,
        isFirebaseAvailable,
    };
};

