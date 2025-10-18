import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { chatbotColors } from '../../theme/styles';

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
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  handleLongPress, 
  showTranslation, 
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

            <View style={styles.messageContent}>
                <TouchableOpacity
                    onLongPress={() => isTranslatable && handleLongPress(message.id, message.text)}
                    onPress={() => isTranslatable && handleLongPress(message.id, message.text)}
                    activeOpacity={0.8}
                    style={bubbleStyles}
                >
                    <View>
                        <Text style={textStyles}>
                        {message.text}
                        </Text>
                        <View style={styles.metadataRow}>
                        <Text style={isUser ? styles.userTimestamp : styles.aiTimestamp}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {isUser && (
                <View style={styles.avatarContainer}>
                <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>👤</Text>
                </View>
                <Text style={styles.userAvatarLabel}>You</Text>
                </View>
            )}
        </View>

        {isTranslationActive && (
            <View style={[styles.translationRow, isUser ? styles.userRow : styles.aiRow]}>
                {isAI && <View style={styles.avatarSpacer} />}

                <View style={[styles.translationBubble, isUser ? styles.userTranslation : styles.aiTranslationContent]}>
                    <View style={styles.translationIconContainer}>
                        <Text style={styles.translationIconText}>文A</Text> 
                    </View>
                    <Text style={styles.translationText}>{showTranslation.translation}</Text>
                </View>
            </View>
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
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${chatbotColors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 20,
  },
  userAvatarLabel: {
    fontSize: 10,
    color: chatbotColors.mutedForeground,
    marginTop: 4,
  },
  messageContent: {
    flexShrink: 1,
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
    borderWidth: 1,
    borderColor: `${chatbotColors.primary}10`,
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
