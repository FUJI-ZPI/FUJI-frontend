import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  Image,
  Animated,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import MessageBubble, { MessageBubbleProps } from '../components/chatbot/MessageBubble'
import ChatInput from '../components/chatbot/ChatInput';
import { chatbotColors } from '../theme/styles';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, loadUser } from '../utils/user';
import { 
  Menu, 
  MenuOptions, 
  MenuOption, 
  MenuTrigger 
} from 'react-native-popup-menu';
import { Feather } from '@expo/vector-icons'; 


const AI_SENSEI_AVATAR = require('../../assets/ai-sensei-avatar.jpeg');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isJapanese?: boolean;
  english?: string;
  note?: string;
}

const ChatbotLoadingIndicator: React.FC<{ text: string }> = ({ text }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();

        return () => {
            rotateAnim.stopAnimation();
        };
    }, [rotateAnim]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.loadingBubbleContent}>
            <Animated.View style={[styles.rotatingSquare, { transform: [{ rotate }] }]} />
            <Text style={styles.loadingText}>
                {text} 
            </Text>
        </View>
    );
};


const ChatbotScreen: React.FC<any> = () => {
  const { t } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'こんにちは！日本語の練習をしましょう。何について話したいですか？',
      isUser: false,
      timestamp: new Date(),
      isJapanese: true,
      english: "Hello! Let's practice Japanese. What would you like to talk about?"
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
  }, [messages, loading]); 

  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    async function init() {
      const u = await loadUser();
      if (u) {
        setUser(u);
      }
    }
    init();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

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

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/chatbot/ask`, {
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
    } finally {
      setLoading(false)
    }
  };


  const handleLongPress: MessageBubbleProps['handleLongPress'] = (messageId, text) => {
    if (showTranslation?.messageId === messageId) {
      setShowTranslation(null); 
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
      <SafeAreaView style={styles.fullScreen} edges={['top', 'left', 'right', 'bottom']}>
        <Menu style={styles.infoMenu}>
          <MenuTrigger>
            <Feather name="info" size={22} color={chatbotColors.mutedForeground} />
          </MenuTrigger>
          <MenuOptions optionsContainerStyle={styles.tooltipContainer}>
            <MenuOption onSelect={() => {}} disabled={true}>
              <Text style={styles.tooltipText}>
                {t('chat.sessionInfo')}
              </Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
        
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
              userAvatar={user?.photo}
            />
          ))}
          {loading && (
            <View style={[styles.messageRow, styles.aiRow, styles.loadingRow]}>
                <View style={styles.avatarContainer}>
                    <Image 
                        source={AI_SENSEI_AVATAR}
                        style={styles.aiAvatarImage}
                        accessibilityLabel="AI Sensei Avatar"
                    />
                    <Text style={styles.aiAvatarLabel}>AI先生</Text>
                </View>
                <View style={styles.aiBubbleBase}>
                    <ChatbotLoadingIndicator text={t('chat.thinking')} />
                </View>
            </View>
          )}
        </ScrollView>

        <ChatInput 
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          placeholder={t('chat.placeholder')}
          disabled={loading} 
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
  
  infoMenu: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  tooltipContainer: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },

  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 5,
    paddingTop: 0,
    paddingBottom: 20, 
  },
  loadingRow: {
    marginBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 40,
  },
  aiAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${chatbotColors.primary}20`,
    borderWidth: 1,
    borderColor: `${chatbotColors.primary}50`,
  },
  aiAvatarLabel: {
    fontSize: 10,
    color: chatbotColors.mutedForeground,
    marginTop: 4,
  },
  aiBubbleBase: {
    padding: 12,
    borderRadius: 12,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    maxWidth: '85%',
    minWidth: 70, 
    backgroundColor: chatbotColors.card,
    borderWidth: 1,
    borderColor: `${chatbotColors.primary}10`,
  },
  rotatingSquare: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: chatbotColors.primary,
    borderTopColor: 'transparent',
    borderRadius: 6,
  },
  loadingBubbleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: chatbotColors.mutedForeground,
  },
});

export default ChatbotScreen;