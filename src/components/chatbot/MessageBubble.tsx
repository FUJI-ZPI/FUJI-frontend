import React, {useEffect, useRef, useState} from 'react';
import {Animated, Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {chatbotColors} from '../../theme/styles';

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
        if (isTranslationActive) {
            setIsTranslationRendered(true);
            Animated.timing(anim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(anim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start(() => {
                setIsTranslationRendered(false);
            });
        }
    }, [isTranslationActive, anim]);

    const animatedStyle = {
        opacity: anim,
        transform: [
            {
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.96, 1],
                }),
            },
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
                        <Text style={styles.translationIconText}>文A</Text> 
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
    alignItems: 'flex-start',
    marginTop: 8,
    maxWidth: '100%',
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
    borderRadius: 12,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    maxWidth: '85%',
  },
  aiBubble: {
    backgroundColor: chatbotColors.card,
  },
  userBubble: {
    backgroundColor: chatbotColors.primary,
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
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
  },
  nonJapaneseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  aiTimestamp: {
    fontSize: 10,
    color: chatbotColors.mutedForeground,
  },
  userTimestamp: {
    fontSize: 10,
    color: `${chatbotColors.primaryForeground}A0`, 
  },
  translationBubble: {
    backgroundColor: chatbotColors.card,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    maxWidth: '85%', 
    flexShrink: 1, 
  },
  translationIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  translationIconText: {
    fontSize: 14,
    color: chatbotColors.translationBorder,
    fontWeight: 'bold',
  },
  aiTranslationContent: {
    alignSelf: 'flex-start',
  },
  userTranslation: {
    alignSelf: 'flex-end',
  },
  translationText: {
    fontSize: 16, 
    color: chatbotColors.foreground,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default MessageBubble;
