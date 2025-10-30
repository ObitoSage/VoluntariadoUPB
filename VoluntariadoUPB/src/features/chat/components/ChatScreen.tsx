import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useThemeColors } from '../../../../src/hooks/useThemeColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChat } from '../hooks/useChat';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { pickImage } from './AttachmentPicker';

const ChatScreen: React.FC<{ initialChatId?: string }> = ({ initialChatId }) => {
  const { colors } = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const { chatId, messages, isWriting, isLoading, sendMessage, cancel } = useChat(initialChatId);

  return (
  <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }] }>
      <View style={styles.header}>
        <Image source={require('../../../../assets/Plantini/plantini.png')} style={styles.headerAvatar} />
        <View >
          <Text style={styles.headerTitle}>Plantini · Asistente de VoluntariadoUPB</Text>
          <Text style={styles.headerSubtitle}>Solo responde preguntas relacionadas con la app</Text>
        </View>
      </View>

      <View style={styles.list}>
        <MessageList messages={messages} />
      </View>

      {isWriting && (
        <View style={styles.typing}><Text style={{ color: colors.muted }}>Plantini está escribiendo...</Text></View>
      )}

      <ChatInput
        onSend={(text) => sendMessage(text)}
        isSending={isLoading}
        onAttach={async () => {
          const file = await pickImage();
          if (file) {
            sendMessage('Adjunto imagen', [file]);
          }
        }}
      />

      {isLoading && (
        <TouchableOpacity style={[styles.cancel, { bottom: insets.bottom + 16 }]} onPress={() => cancel()}>
          <Text style={{ color: '#fff' }}>Cancelar</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
    
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { padding: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
    headerTitle: { fontWeight: '700', color: colors.text },
    headerSubtitle: { color: colors.muted, marginTop: 4, fontSize: 12 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    list: { flex: 1 },
    typing: { paddingHorizontal: 12, paddingVertical: 6 },
    cancel: { position: 'absolute', right: 12, bottom: 90, backgroundColor: '#e74c3c', padding: 8, borderRadius: 8 },
  });

export default ChatScreen;
