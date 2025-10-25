import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../../../src/hooks/useThemeColors';

export const ChatInput: React.FC<{
  onSend: (text: string, files?: any[]) => void;
  isSending?: boolean;
  onAttach?: (uri: string) => void;
}> = ({ onSend, isSending, onAttach }) => {
  const [text, setText] = useState('');
  const { colors } = useThemeColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={async () => {
          if (onAttach) onAttach('');
        }}
        style={styles.attach}
        accessibilityLabel="Adjuntar archivo"
      >
        <Ionicons name="image-outline" size={22} color={colors.primary} />
      </TouchableOpacity>
      <TextInput
        value={text}
        onChangeText={setText}
        style={styles.input}
        placeholder="Escribe un mensaje..."
        placeholderTextColor={colors.muted}
        multiline
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onSend(text.trim());
          setText('');
        }}
        disabled={isSending || text.trim().length === 0}
        accessibilityLabel="Enviar mensaje"
      >
        <Ionicons name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    attach: { padding: 8, marginRight: 6 },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surface,
      borderRadius: 20,
      color: colors.text,
    },
    button: {
      marginLeft: 8,
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
