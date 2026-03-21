import React, {useCallback} from 'react';
import {TouchableOpacity, Text, Alert, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {SPACING, BORDER_RADIUS} from '@utils/constants';
import {normalize} from '@utils/helpers';

const DisconnectButton = ({onDisconnect}) => {
  const {theme} = useTheme();

  const handlePress = useCallback(() => {
    Alert.alert(
      'Disconnect Partner',
      'Are you sure you want to disconnect? This will remove all shared data between you and your partner.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: onDisconnect,
        },
      ],
    );
  }, [onDisconnect]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.button, {borderColor: theme.colors.error}]}
      activeOpacity={0.7}>
      <Text style={[styles.text, {color: theme.colors.error}]}>
        Disconnect Partner
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  text: {
    fontSize: normalize(15),
    fontWeight: '600',
  },
});

export default DisconnectButton;
