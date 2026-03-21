import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {useHaptic} from '@hooks/useHaptic';
import GlassCard from '@components/common/GlassCard';
import {PARTNER_QUICK_ACTIONS, SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const QuickActionGrid = ({onNavigate}) => {
  const {theme} = useTheme();
  const {selection} = useHaptic();

  const handlePress = screen => {
    selection();
    onNavigate(screen);
  };

  return (
    <View style={styles.grid}>
      {PARTNER_QUICK_ACTIONS.map(action => (
        <GlassCard
          key={action.id}
          onPress={() => handlePress(action.screen)}
          style={styles.card}>
          <Text style={styles.icon}>{action.icon}</Text>
          <Text style={[styles.label, {color: theme.colors.text}]}>
            {action.label}
          </Text>
        </GlassCard>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  icon: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: normalize(12),
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default QuickActionGrid;
