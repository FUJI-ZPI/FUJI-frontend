import React, { useEffect, useState, useContext } from 'react';
import { 
  View, Text, Image, TouchableOpacity, 
  StyleSheet, ActivityIndicator, Alert 
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Toast } from 'toastify-react-native';
import { useTranslation } from 'react-i18next';
import { User } from '../utils/user';

const FUJI_LOGO = require('../../assets/fuji-logo-kanji.jpeg');
const GOOGLE_LOGO = require('../../assets/google-icon.png')

const LoginScreen = ({ navigation, onLogin }: any) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        offlineAccess: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error('No idToken from Google.');

      const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      await SecureStore.setItemAsync('accessToken', data.access);
      await SecureStore.setItemAsync('refreshToken', data.refresh);

      const user: User = {
        name: userInfo.data?.user?.name || "",
        email: userInfo.data?.user?.email || "",
        photo: userInfo.data?.user?.photo || "",
      };

      await SecureStore.setItemAsync('user', JSON.stringify(user));

      Toast.success('You have successfully logged in via Google.');
      onLogin();
    } catch (error) {
      console.error('Error logging in to the backend:', error);
      Alert.alert('Login error', String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={FUJI_LOGO} style={styles.logo} />
        <Text style={styles.title}>{t("login.card_title")}</Text>
        <Text style={styles.subtitle}>{t("login.card_description")}</Text>

        <TouchableOpacity
          disabled={loading}
          onPress={handleGoogleLogin}
          style={styles.googleButton}
        >
          <Image source={GOOGLE_LOGO} style={styles.googleIcon} />
          <Text style={styles.googleText}>{t("login.button")}</Text>
        </TouchableOpacity>
    
        {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}
        
        <Text style={styles.note}>DO TESTÓW</Text>

        <TouchableOpacity
        disabled={loading}
        onPress={async () => {
          setLoading(true);
          try {
            const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/auth/login-mock`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const data = await res.json();

            await SecureStore.setItemAsync('accessToken', data.access);
            await SecureStore.setItemAsync('refreshToken', data.refresh);
          
            Toast.success('Test logged in without Google! (mock)');
            onLogin();
          } catch (e) {
            console.error('Error logging in with mock:', e);
            Alert.alert('Mock login error', String(e));
          } finally {
            setLoading(false);
          }
        }}
        style={styles.googleButton}
      >
        <Text style={styles.googleText}>🔧 Mock Login</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5eee9ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#579170ff',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 24,
    marginTop: 6,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    justifyContent: 'center',
    width: '100%',
  },
  googleIcon: {
    width: 20,
    height: 20.5,
    marginRight: 12,
  },
  googleText: {
    color: '#111827',
    fontWeight: '500',
    fontSize: 16,
  },
  note: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
});
