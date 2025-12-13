import React from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {chatbotColors} from '../../theme/styles';

interface ChatInputProps {
    inputText: string;
    setInputText: (text: string) => void;
    sendMessage: () => void;
    placeholder: string;
    disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
                                                 inputText,
                                                 setInputText,
                                                 sendMessage,
                                                 placeholder,
                                                 disabled = false,
                                             }) => (
    <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
            <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={placeholder}
                placeholderTextColor={chatbotColors.mutedForeground}
                style={styles.textInput}
                multiline
                editable={!disabled}
            />
        </View>
        <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || disabled}
            style={[
                styles.sendButton,
                (!inputText.trim() || disabled) && styles.disabledSendButton,
            ]}
        >
            <Ionicons name="send" size={20} color={chatbotColors.primaryForeground}/>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    inputArea: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: chatbotColors.card,
        borderTopWidth: 1,
        borderTopColor: chatbotColors.border,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: `${chatbotColors.background}A0`,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: chatbotColors.border,
        paddingHorizontal: 15,
        maxHeight: 120,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        fontSize: 16,
        color: chatbotColors.foreground,
        paddingVertical: 10,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: chatbotColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledSendButton: {
        opacity: 0.5,
    },
});

export default ChatInput;