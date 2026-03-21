import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import GlassCard from '@components/common/GlassCard';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize, getInitials} from '@utils/helpers';

const PartnerInfoCard = ({partner}) => {
  const {theme} = useTheme();

  if (!partner) return null;

  const initials = getInitials(partner.displayName);
  const connectedDate = partner.connectedAt
    ? new Date(
        partner.connectedAt.toDate?.() || partner.connectedAt,
      ).toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'})
    : '';

  return (
    <GlassCard style={styles.container}>
      <View style={styles.row}>
        {/* Avatar */}
        <View style={[styles.avatar, {backgroundColor: theme.colors.primary + '25'}]}>
          <Text style={[styles.initials, {color: theme.colors.primary}]}>
            {initials}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, {color: theme.colors.text}]}>
              {partner.displayName}
            </Text>
            <View style={styles.statusDot} />
          </View>
          {connectedDate ? (
            <Text style={[styles.since, {color: theme.colors.textSecondary}]}>
              Connected since {connectedDate}
            </Text>
          ) : null}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontSize: normalize(20),
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  name: {
    ...TYPOGRAPHY.h3,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  since: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
});

export default PartnerInfoCard;
