import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {useTrackerContext} from '@context/TrackerContext';
import {GlassCard, GradientButton} from '@components/common';
import {TrackerDashboard} from '@components/tracker';
import {SCREEN_NAMES, SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';

const ProfileScreen = () => {
  const {theme} = useTheme();
  const {user, userProfile, logout} = useAuth();
  const tracker = useTrackerContext();
  const navigation = useNavigation();

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.content}>
      {/* Header with gear icon */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, {color: theme.colors.text}]}>Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate(SCREEN_NAMES.SETTINGS)}
          style={styles.gearBtn}
          accessibilityLabel="Settings"
          accessibilityRole="button">
          <Text style={[styles.gearIcon, {color: theme.colors.textSecondary}]}>
            ⚙
          </Text>
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.card}>
        <Text style={[styles.name, {color: theme.colors.text}]}>
          {userProfile?.displayName || user?.displayName || 'User'}
        </Text>
        <Text style={[styles.email, {color: theme.colors.textSecondary}]}>
          {user?.email || ''}
        </Text>
      </GlassCard>

      {/* Wellness Tracker Dashboard */}
      <View style={styles.trackerSection}>
        <TrackerDashboard
          journalCount={tracker.journalCount}
          kegelStats={tracker.kegelStats}
          goalStats={tracker.goalStats}
          badgeCount={tracker.badgeCount}
        />
      </View>

      <GradientButton
        title="Sign Out"
        onPress={logout}
        variant="outline"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.hero,
  },
  gearBtn: {
    padding: SPACING.sm,
  },
  gearIcon: {
    fontSize: 26,
  },
  card: {
    marginBottom: SPACING.md,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  trackerSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  logoutButton: {
    marginTop: SPACING.lg,
  },
});

export default ProfileScreen;
