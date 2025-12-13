import {registerRootComponent} from 'expo';

import App from './App';

// Inicjalizacja Firebase background handler - tylko jeśli Firebase jest dostępny
try {
    // Dynamic import aby nie blokować startu aplikacji
    const messaging = require('@react-native-firebase/messaging').default;

    messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    });
} catch (error) {
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
