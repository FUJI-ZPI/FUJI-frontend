import {useEffect, useState} from 'react';
import * as SecureStore from 'expo-secure-store';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import * as Notifications from 'expo-notifications';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const usePushNotifications = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<string>('not_determined');
    const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);

    useEffect(() => {
        let messaging: any;
        let getMessaging: any;
        let getApp: any;
        try {
            const firebaseMessaging = require('@react-native-firebase/messaging');
            messaging = firebaseMessaging.default;
            getMessaging = firebaseMessaging.getMessaging;
            const firebaseApp = require('@react-native-firebase/app');
            getApp = firebaseApp.getApp;
            setIsFirebaseAvailable(true);
        } catch (error) {
            setIsFirebaseAvailable(false);
            return;
        }

        const messagingInstance = getMessaging ? getMessaging(getApp()) : messaging();

        const sendTokenToBackend = async (token: string) => {
            try {
                const accessToken = await SecureStore.getItemAsync('accessToken');

                if (!accessToken) {
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

                if (!response.ok) {
                    console.error('Failed to send FCM token to backend:', response.status);
                }
            } catch (error) {
                console.error('Error sending FCM token to backend:', error);
            }
        };

        const requestUserPermission = async () => {
            try {
                if (Platform.OS === 'android' && Platform.Version >= 33) {
                    try {
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                        );

                        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                            setPermissionStatus('denied');
                            return;
                        }
                    } catch (err) {
                        console.error('Error requesting POST_NOTIFICATIONS permission:', err);
                        setPermissionStatus('error');
                        return;
                    }
                }

                const {status: existingStatus} = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const {status} = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    setPermissionStatus('denied');
                    return;
                }

                setPermissionStatus('granted');

                const tokenPromise = messagingInstance.getToken();
                const tokenTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Token fetch timeout')), 10000)
                );

                const token = await Promise.race([tokenPromise, tokenTimeout]) as string;
                setFcmToken(token);

                await sendTokenToBackend(token);
            } catch (error) {
                console.error('Error requesting push notification permission:', error);
                setPermissionStatus('error');
            }
        };

        let unsubscribeForeground: (() => void) | undefined;
        let unsubscribeBackground: (() => void) | undefined;
        let unsubscribeTokenRefresh: (() => void) | undefined;

        const initializeFirebase = async () => {
            try {
                unsubscribeForeground = messagingInstance.onMessage(async (remoteMessage: any) => {
                    if (remoteMessage.notification) {
                        Alert.alert(
                            remoteMessage.notification.title || 'Notification',
                            remoteMessage.notification.body || ''
                        );
                    }
                });

                unsubscribeBackground = messagingInstance.onNotificationOpenedApp((remoteMessage: any) => {
                });

                messagingInstance.getInitialNotification();

                await requestUserPermission();

                unsubscribeTokenRefresh = messagingInstance.onTokenRefresh(async (token: string) => {
                    setFcmToken(token);
                    await sendTokenToBackend(token);
                });
            } catch (error) {
                console.error('Error initializing Firebase messaging:', error);
            }
        };

        const timer = setTimeout(() => {
            initializeFirebase();
        }, 1000);

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

