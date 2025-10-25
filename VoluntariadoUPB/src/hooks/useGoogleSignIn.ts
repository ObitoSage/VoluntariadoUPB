import { useEffect, useState } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '../store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_WEB_CLIENT_ID = '1087093435939-501g0of80oi61be9bg4u7jhnfmpfgjhv.apps.googleusercontent.com';

export const useGoogleSignIn = () => {
  const { signInWithGoogle, isLoading } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_WEB_CLIENT_ID,
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
