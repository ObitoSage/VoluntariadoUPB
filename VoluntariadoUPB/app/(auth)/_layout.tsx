import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { ErrorModal } from '../../src/components';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AuthLayout() {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { error, clearError } = useAuthStore();

  // Escuchar cambios en el error del store
  useEffect(() => {
    if (error) {
      setErrorMessage(error);
      setShowErrorModal(true);
    }
  }, [error]);

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
    clearError();
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>
      
      {/* Modal de Error a nivel de Layout */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={handleCloseErrorModal}
      />
    </>
  );
}
