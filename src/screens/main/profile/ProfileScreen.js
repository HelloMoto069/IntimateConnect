import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {GlassCard, AnimatedToggle, GradientButton} from '@components/common';

const ProfileScreen = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {user, userProfile, logout} = useAuth();

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

      <GlassCard style={styles.card}>
        <Text style={[styles.sectionTitle, {color: theme.colors.textSecondary}]}>
          Wellness Tracker — Coming in Phase 6
        </Text>
      </GlassCard>

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
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 24,
  },
});

export default ProfileScreen;
