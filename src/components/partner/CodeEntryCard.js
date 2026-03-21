import React, {useState, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import GlassCard from '@components/common/GlassCard';
import GradientButton from '@components/common/GradientButton';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const VALID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const CodeEntryCard = ({onConnect, isConnecting, error}) => {
  const {theme} = useTheme();
  const [code, setCode] = useState('');
  const inputRef = useRef(null);

  const handleChange = text => {
    const filtered = text
      .toUpperCase()
      .split('')
      .filter(c => VALID_CHARS.includes(c))
      .join('')
      .substring(0, 6);
    setCode(filtered);
  };

  const handleConnect = () => {
    if (code.length === 6) {
      onConnect(code);
    }
  };

  const boxes = Array(6).fill('');
  for (let i = 0; i < code.length; i++) {
    boxes[i] = code[i];
  }

  return (
    <GlassCard style={styles.container}>
      <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
        Enter Partner's Code
      </Text>

      {/* Visual boxes */}
      <View style={styles.boxRow}>
        {boxes.map((char, i) => (
          <View
            key={i}
            style={[
              styles.box,
              {
                backgroundColor: theme.colors.surfaceLight,
                borderColor: char
                  ? theme.colors.primary
                  : theme.colors.surfaceLight,
              },
            ]}>
            <Text style={[styles.boxChar, {color: theme.colors.text}]}>
              {char}
            </Text>
          </View>
        ))}
      </View>

      {/* Hidden input */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={6}
        style={styles.hiddenInput}
        returnKeyType="done"
        onSubmitEditing={handleConnect}
      />

      {/* Tap to focus */}
      <View style={styles.tapArea}>
        <Text
          style={[styles.tapHint, {color: theme.colors.textSecondary}]}
          onPress={() => inputRef.current?.focus()}>
          Tap to enter code
        </Text>
      </View>

      {error && (
        <Text style={[styles.error, {color: theme.colors.error}]}>
          {error}
        </Text>
      )}

      <GradientButton
        label={isConnecting ? 'Connecting...' : 'Connect'}
        onPress={handleConnect}
        disabled={code.length !== 6 || isConnecting}
        style={styles.connectBtn}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.lg,
  },
  boxRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  box: {
    width: 44,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChar: {
    fontSize: normalize(22),
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  tapArea: {
    marginBottom: SPACING.md,
  },
  tapHint: {
    ...TYPOGRAPHY.caption,
  },
  error: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  connectBtn: {
    width: '100%',
  },
});

export default CodeEntryCard;
