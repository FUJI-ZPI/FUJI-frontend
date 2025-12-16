import * as SecureStore from 'expo-secure-store';

export interface User {
    name: string;
    email?: string;
    photo?: string;
}

export async function loadUser() {
    const storedUser = await SecureStore.getItemAsync('user');
    if (storedUser) {
        return JSON.parse(storedUser);
    }
    return null;
}