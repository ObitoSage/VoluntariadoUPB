import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/useAuthStore';

// Necesario para que funcione en Expo Go
WebBrowser.maybeCompleteAuthSession();

// IMPORTANTE: Debes reemplazar estos valores con tus propios Client IDs de Google Cloud Console
// Para obtenerlos:
// 1. Ve a https://console.cloud.google.com/
// 2. Crea un proyecto o selecciona uno existente
// 3. Habilita Google Sign-In API
// 4. Ve a "Credentials" y crea OAuth 2.0 Client IDs para:
//    - Android (usa el SHA-1 de tu keystore)
//    - iOS (usa el bundle identifier de tu app)
//    - Web (para Expo Go)
//
// Redirect URI para Expo: https://auth.expo.io/@obitosage/VoluntariadoUPB

const GOOGLE_WEB_CLIENT_ID = '1087093435939-501g0of80oi61be9bg4u7jhnfmpfgjhv.apps.googleusercontent.com';

export const useGoogleSignIn = () => {
  const { signInWithGoogle, isLoading } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID, // Usa el mismo para iOS en desarrollo
    androidClientId: GOOGLE_WEB_CLIENT_ID, // Usa el mismo para Android en desarrollo
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleSignIn(id_token);
    } else if (response?.type === 'error') {
      console.error('Error en Google Sign-In:', response.error);
      setIsSigningIn(false);
    } else if (response?.type === 'cancel') {
      setIsSigningIn(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle(idToken);
      // El redireccionamiento se maneja en el componente
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const signIn = async () => {
    try {
      setIsSigningIn(true);
      await promptAsync();
    } catch (error) {
      console.error('Error al iniciar Google Sign-In:', error);
      setIsSigningIn(false);
    }
  };

  return {
    signIn,
    isLoading: isLoading || isSigningIn,
    disabled: !request,
  };
};
