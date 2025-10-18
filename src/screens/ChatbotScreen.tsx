import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';

import MessageBubble, { MessageBubbleProps } from '../components/chatbot/MessageBubble'
import ChatInput from '../components/chatbot/ChatInput';
import { chatbotColors } from '../theme/styles';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isJapanese?: boolean;
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
  const [showTranslation, setShowTranslation] = useState<{messageId: string, translation: string} | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const mockAIResponses = [
    'とても良いですね！もっと教えてください。',
    '面白いですね。日本語でどう言いますか？',
    'そうですね。他に何か質問がありますか？',
    '素晴らしい！続けてください。',
    'はい、分かりました。次は何を練習しましょうか？'
  ];

  const mockTranslations: { [key: string]: string } = {
    'こんにちは！日本語の練習をしましょう。何について話したいですか？': 'Hello! Let\'s practice Japanese. What would you like to talk about?',
    'とても良いですね！もっと教えてください。': 'That\'s very good! Please tell me more.',
    '面白いですね。日本語でどう言いますか？': 'That\'s interesting. How do you say it in Japanese?',
    'そうですね。他に何か質問がありますか？': 'I see. Do you have any other questions?',
    '素晴らしい！続けてください。': 'Wonderful! Please continue.',
    'はい、分かりました。次は何を練習しましょうか？': 'Yes, I understand. What shall we practice next?'
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)],
        isUser: false,
        timestamp: new Date(),
        isJapanese: true
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleLongPress: MessageBubbleProps['handleLongPress'] = (messageId, text) => {
    if (showTranslation?.messageId === messageId) {
      setShowTranslation(null);
      return;
    }
    
    const translation = mockTranslations[text] || t('chat.translation_not_available');
    setShowTranslation({ messageId, translation });
  };

  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.fullScreen}
    >
      <SafeAreaView style={styles.fullScreen}>
        
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