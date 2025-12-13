import React, {useState} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import {Ionicons} from '@expo/vector-icons';

const accentBlue = '#3B82F6';

export const MnemonicTooltipButton = React.memo(
    ({mnemonicText, icon}: { mnemonicText: string | null; icon: any }) => {
        const [visible, setVisible] = useState(false);
        const cleanText = (mnemonicText || '').replace(/<[^>]*>/g, '');

        return (
            <Tooltip
                isVisible={visible}
                content={
                    <Text style={{color: '#fff', fontSize: 14}}>
                        {cleanText || 'No mnemonic available.'}
                    </Text>
                }
                placement="bottom"
                onClose={() => setVisible(false)}
                useInteractionManager={true}
                contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    padding: 10,
                    borderRadius: 8,
                }}
                arrowStyle={{borderTopColor: 'rgba(0,0,0,0.85)'}}
                disableShadow
                backgroundColor="rgba(0,0,0,0.3)"
                closeOnChildInteraction={false}
                closeOnContentInteraction={false}
                showChildInTooltip={false}
            >
                <TouchableOpacity onPress={() => setVisible(true)} style={{padding: 4}}>
                    <Ionicons name={icon} size={20} color={accentBlue}/>
                </TouchableOpacity>
            </Tooltip>
        );
    }
);
