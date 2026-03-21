import React, {useCallback} from 'react';
import {View, Text, TouchableOpacity, Clipboard, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import GlassCard from '@components/common/GlassCard';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const PartnerCodeCard = ({code, onRegenerate}) => {
  const {theme} = useTheme();
  const {success} = useHaptic();

  const handleShare = useCallback(() => {
    if (!code) return;
    Clipboard.setString(code);
    success();
  }, [code, success]);

  const displayCode = code
    ? code.split('').join(' ')
    : '• • • • • •';

  return (
    <GlassCard style={styles.container}>
      <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
        Your Partner Code
      </Text>
      <Text style={[styles.code, {color: theme.colors.primary}]}>
        {displayCode}
      </Text>
      <Text style={[styles.hint, {color: theme.colors.textSecondary}]}>
        Share this code with your partner to connect
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleShare}
          style={[styles.actionBtn, {backgroundColor: theme.colors.primary + '20'}]}>
          <Text style={[styles.actionText, {color: theme.colors.primary}]}>
            Copy Code
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onRegenerate}
          style={[styles.actionBtn, {backgroundColor: theme.colors.surfaceLight}]}>
          <Text style={[styles.actionText, {color: theme.colors.textSecondary}]}>
            Regenerate
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: SPACING.md,
  },
  code: {
    fontSize: normalize(32),
    fontWeight: '800',
    letterSpacing: 6,
    marginBottom: SPACING.sm,
  },
  hint: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  actionText: {
    fontSize: normalize(13),
    fontWeight: '600',
  },
});

export default PartnerCodeCard;
