import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {useTrackerContext} from '@context/TrackerContext';
import {GlassCard, AnimatedToggle, GradientButton} from '@components/common';
import {TrackerDashboard} from '@components/tracker';
import {SPACING, TYPOGRAPHY} from '@utils/constants';

const ProfileScreen = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {user, userProfile, logout} = useAuth();
  const tracker = useTrackerContext();

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      contentContainerStyle={styles.content}>
      <Text style={[styles.title, {color: theme.colors.text}]}>Profile</Text>

      <GlassCard style={styles.card}>
        <Text style={[styles.name, {color: theme.colors.text}]}>
          {userProfile?.displayName || user?.displayName || 'User'}
        </Text>
        <Text style={[styles.email, {color: theme.colors.textSecondary}]}>
          {user?.email || ''}
        </Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <AnimatedToggle
          label="Dark Mode"
          value={isDark}
          onToggle={toggleTheme}
        />
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
  title: {
    ...TYPOGRAPHY.hero,
    marginBottom: SPACING.lg,
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
