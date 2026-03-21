import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import GlassCard from '@components/common/GlassCard';
import {SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const StatItem = ({value, label, color}) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, {color}]}>{value}</Text>
    <Text style={[styles.statLabel, {color: color + '99'}]}>{label}</Text>
  </View>
);

const CoupleStatsCard = ({stats}) => {
  const {theme} = useTheme();

  return (
    <GlassCard>
      <View style={styles.row}>
        <StatItem
          value={stats.daysConnected}
          label="Days"
          color={theme.colors.primary}
        />
        <View style={[styles.divider, {backgroundColor: theme.colors.surfaceLight}]} />
        <StatItem
          value={stats.positionsExplored}
          label="Explored"
          color={theme.colors.primary}
        />
        <View style={[styles.divider, {backgroundColor: theme.colors.surfaceLight}]} />
        <StatItem
          value={stats.gamesPlayed}
          label="Games"
          color={theme.colors.primary}
        />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: normalize(28),
    fontWeight: '800',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
  },
});

export default CoupleStatsCard;
