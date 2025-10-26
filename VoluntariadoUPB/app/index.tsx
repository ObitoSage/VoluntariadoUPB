import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/useAuthStore';
import { SplashScreen } from '../src/components';

let hasShownSplash = false;

export default function HomeRedirect() {
  const { user, isLoading, error } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(!hasShownSplash);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = () => {
    hasShownSplash = true;
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if ((isLoading || checking) && !error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(drawer)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}