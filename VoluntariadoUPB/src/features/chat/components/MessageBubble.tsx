import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '../types/Message';
import { useThemeColors } from '../../../../src/hooks/useThemeColors';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const { colors } = useThemeColors();
  const styles = getStyles(colors);

  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.user : styles.model]}>
      <Text style={[styles.text, isUser ? styles.userText : styles.modelText]}>{message.content}</Text>
      {/* Files preview could be added here */}
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 6,
      padding: 12,
      maxWidth: '80%',
      borderRadius: 12,
    },
    user: {
      backgroundColor: colors.primary + '10',
      alignSelf: 'flex-end',
      borderTopRightRadius: 4,
    },
    model: {
      backgroundColor: colors.surface,
      alignSelf: 'flex-start',
      borderTopLeftRadius: 4,
    },
    text: {
      fontSize: 15,
      lineHeight: 20,
    },
    userText: { color: colors.primary },
    modelText: { color: colors.text },
  });
