import React, { useRef, useEffect } from 'react';
import { FlatList, View } from 'react-native';
import type { Message } from '../types/Message';
import { MessageBubble } from './MessageBubble';

export const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const ref = useRef<FlatList>(null as any);

  useEffect(() => {
    if (ref.current && messages.length > 0) {
      setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  return (
    <FlatList
      ref={ref}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={{ padding: 12 }}
    />
  );
};
