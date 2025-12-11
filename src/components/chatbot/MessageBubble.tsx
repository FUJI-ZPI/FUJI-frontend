import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  LayoutAnimation,
  Platform,
  UIManager,
  Easing
} from 'react-native';
import {chatbotColors} from '../../theme/styles';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isJapanese?: boolean;
}

const AI_SENSEI_AVATAR = require('../../../assets/ai-sensei-avatar.jpeg');

export interface MessageBubbleProps {
  message: Message;
  handleLongPress: (messageId: string, text: string) => void;
  showTranslation: { messageId: string, translation: string } | null;
  userAvatar: string | undefined
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  handleLongPress, 
  showTranslation,
  userAvatar 
}) => {
  const isUser = message.isUser;
  const isTranslatable = message.isJapanese; 
  
  const bubbleStyles = [
    styles.messageBubble,
    isUser ? styles.userBubble : styles.aiBubble,
  ];

  const textStyles = [
    styles.messageText,
    isUser ? styles.userText : styles.aiText,
    message.isJapanese ? styles.japaneseText : styles.nonJapaneseText,
  ];
  
  const isTranslationActive = showTranslation?.messageId === message.id;
  const isAI = !isUser;

  const [isTranslationRendered, setIsTranslationRendered] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // LayoutAnimation zajmuje się przesuwaniem sąsiednich elementów
    LayoutAnimation.configureNext({
        duration: 300,
        create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
        update: { type: LayoutAnimation.Types.easeInEaseOut },
        delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity }
    });

    if (isTranslationActive) {
      setIsTranslationRendered(true);
      // Animacja wejścia: "Wyskoczenie"
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.7)), // Lekkie odbicie przy otwieraniu
      }).start();
    } else {
      // Animacja wyjścia: "Wessanie" z powrotem
      Animated.timing(anim, {
        toValue: 0,
        duration: 250, // Nieco szybciej przy zamykaniu dla lepszego feelingu
        useNativeDriver: true,
        // Używamy Easing.in(Easing.back), żeby karta "cofnęła się" w ten sam sposób
        easing: Easing.in(Easing.back(1.0)), 
      }).start(() => {
        setIsTranslationRendered(false);
      });
    }
  }, [isTranslationActive, anim]);

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-25, 0], // Większy zakres ruchu dla wyraźniejszego efektu
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
      },
      // Dodajemy skalowanie Y, aby karta "zgniatała się" przy zamykaniu
      // Dzięki temu tekst i tło znikają spójnie w górę
      {
        scaleY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
        })
      }
    ],
  };

  return (
    <View style={styles.messageGroupContainer}>
        <View style={[styles.messageRow, isUser ? styles.userRow : styles.aiRow]}>
            
            {isAI && (
                <View style={styles.avatarContainer}>
                <Image 
                    source={AI_SENSEI_AVATAR}
                    style={styles.aiAvatarImage}
                    accessibilityLabel="AI Sensei Avatar"
                />
                <Text style={styles.aiAvatarLabel}>AI先生</Text>
                </View>
            )}

            <View style={[styles.messageContent, isUser && styles.userMessageContent]}>
                <Pressable
                    onLongPress={() => isTranslatable && handleLongPress(message.id, message.text)}
                    onPress={() => isTranslatable && handleLongPress(message.id, message.text)}
                    delayLongPress={200}
                >
                    <View style={bubbleStyles}>
                        <View style={styles.innerBubbleContent}>
                            <Text style={textStyles}>
                                {message.text}
                            </Text>

                            <View style={[styles.metadataRow, isUser && styles.userMetadataWidthFix]}>
                                <Text style={isUser ? styles.userTimestamp : styles.aiTimestamp}>
                                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </View>

            {isUser && (
                <View style={styles.avatarContainer}>
                  <Image source={userAvatar ? { uri: userAvatar } : undefined} style={[styles.userAvatar, !userAvatar && { backgroundColor: "rgb(54, 138, 89, 0.2)" }]} />
                  <Text style={styles.userAvatarLabel}>You</Text>
                </View>
            )}
        </View>

        {isTranslationRendered && (
            <Animated.View style={[styles.translationRow, isUser ? styles.userRow : styles.aiRow, animatedStyle]}>
                {isAI && <View style={styles.avatarSpacer} />}

                <View style={[styles.translationBubble, isUser ? styles.userTranslation : styles.aiTranslationContent]}>
                    <View style={styles.translationIconContainer}>
                        <Text style={styles.translationIconText}>EN</Text> 
                    </View>
                    <Text style={styles.translationText}>{showTranslation?.translation}</Text>
                </View>
            </Animated.View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  messageGroupContainer: {
    marginBottom: 16,
    maxWidth: '100%',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '100%',
  },
  translationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Ważne: flex-start, aby animacja scaleY "wciągała" do góry
    marginTop: 2, 
    maxWidth: '100%',
    zIndex: -1,
    overflow: 'hidden', // Kluczowe: Ukrywa zawartość podczas animacji zmniejszania
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 40,
  },
  avatarSpacer: {
    width: 40,
    marginHorizontal: 8,
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
  userAvatarLabel: {
    fontSize: 10,
    color: chatbotColors.mutedForeground,
    marginTop: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    textAlignVertical: 'center',
    backgroundColor: "rgb(54, 138, 89, 0.2)",
    borderWidth: 0.5,
    borderColor: 'lightgray',
    borderRadius: 20,
    textAlign: "center",
    lineHeight: 48,
  },
  messageContent: {
    flexShrink: 1,
    alignItems: 'flex-start', 
  },
  userMessageContent: {
    alignItems: 'flex-end',
  },  
  innerBubbleContent: {
    width: '100%',
  },
  userMetadataWidthFix: {
    width: '100%',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16, 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    maxWidth: '85%',
  },
  aiBubble: {
    backgroundColor: chatbotColors.card,
    borderTopLeftRadius: 4, 
  },
  userBubble: {
    backgroundColor: chatbotColors.primary,
    borderTopRightRadius: 4, 
  },
  messageText: {
    fontSize: 16,
  },
  aiText: {
    color: chatbotColors.foreground,
  },
  userText: {
    color: chatbotColors.primaryForeground,
  },
  japaneseText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '500',
  },
  nonJapaneseText: {
    fontSize: 15,
    lineHeight: 22,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  aiTimestamp: {
    fontSize: 10,
    color: chatbotColors.mutedForeground,
    opacity: 0.8,
  },
  userTimestamp: {
    fontSize: 10,
    color: `${chatbotColors.primaryForeground}`, 
    opacity: 0.8,
  },
  translationBubble: {
    backgroundColor: "#fff", 
    borderColor: chatbotColors.card, 
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%', 
    flexShrink: 1,
    marginTop: 2,
  },
  translationIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  translationIconText: {
    fontSize: 10,
    color: chatbotColors.mutedForeground,
    fontWeight: 'bold',
  },
  aiTranslationContent: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 2,
  },
  userTranslation: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 2,
  },
  translationText: {
    fontSize: 15, 
    color: chatbotColors.foreground,
    flex: 1,
    lineHeight: 22,
    fontStyle: 'italic', 
  },
});

export default MessageBubble;