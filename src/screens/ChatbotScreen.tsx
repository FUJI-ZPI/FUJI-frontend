import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import MessageBubble, { MessageBubbleProps } from '../components/chatbot/MessageBubble'
import ChatInput from '../components/chatbot/ChatInput';
import { chatbotColors } from '../theme/styles';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string; // To będzie japońska odpowiedź
  isUser: boolean;
  timestamp: Date;
  isJapanese?: boolean;
  english?: string; // Dodane pole
  note?: string;    // Dodane pole
}

const ChatbotScreen: React.FC<any> = () => {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'こんにちは！日本語の練習をしましょう。何について話したいですか？',
      isUser: false,
      timestamp: new Date(),
      isJapanese: true
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState<{messageId: string, translation: string} | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);


  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

const sendMessage = async () => { // Zmień na async
  if (!inputText.trim()) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    text: inputText,
    isUser: true,
    timestamp: new Date(),
    isJapanese: false,
  };

  const updatedMessages = [...messages, userMessage];
  setMessages(updatedMessages);
  setInputText('');

  try {
    setLoading(true)
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (!accessToken) {
      console.error("Brak tokenu dostępu.");
      return;
    }

    const historyPayload = updatedMessages.map(msg => ({
      messageType: msg.isUser ? 'USER' : 'BOT',
      message: msg.text,
      dateTime: msg.timestamp.toISOString()
    }));

    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/chatbot/v1/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ messages: historyPayload })
    });

    if (!response.ok) {
      throw new Error(`Błąd API: ${response.status}`);
    }

    const data = await response.json();
    setLoading(false)
    if (data.success && data.response) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response.japanese,
        isUser: false,
        timestamp: new Date(),
        isJapanese: true,
        english: data.response.english,
        note: data.response.note
      };
      setMessages(prev => [...prev, aiResponse]);
    } else {
      console.error("API zwróciło błąd lub niekompletną odpowiedź:", data);
    }

  } catch (error) {
    console.error("Błąd podczas wysyłania wiadomości:", error);
    setMessages(messages);
  } finally {
    setLoading(false)
  }
};


const handleLongPress: MessageBubbleProps['handleLongPress'] = (messageId, text) => {
  if (showTranslation?.messageId === messageId) {
    setShowTranslation(null); // Ukryj, jeśli już jest widoczne
    return;
  }

  const messageToTranslate = messages.find(msg => msg.id === messageId);

  if (messageToTranslate && messageToTranslate.english) {
    setShowTranslation({ messageId, translation: messageToTranslate.english });
  } else {
    setShowTranslation({ messageId, translation: t('chat.translation_not_available') });
  }
};


  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.fullScreen}
    >
      <SafeAreaView style={styles.fullScreen}>

        {loading && <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />}
        
        <ScrollView 
          ref={scrollViewRef} 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContentContainer}
        >
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              handleLongPress={handleLongPress}
              showTranslation={showTranslation}
            />
          ))}
        </ScrollView>

        <ChatInput 
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          placeholder={t('chat.placeholder')}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: chatbotColors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 20, 
  },
});

export default ChatbotScreen;