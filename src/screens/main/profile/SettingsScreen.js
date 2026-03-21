import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
  Linking,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {useSettings} from '@hooks/useSettings';
import {useAppLock} from '@hooks/useAppLock';
import {useHaptic} from '@hooks/useHaptic';
import {SCREEN_NAMES, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import GlassCard from '@components/common/GlassCard';
import AnimatedToggle from '@components/common/AnimatedToggle';
import BottomSheet from '@components/common/BottomSheet';
import GradientButton from '@components/common/GradientButton';
import {showToast} from '@components/common/Toast';
import Animated, {FadeInDown} from 'react-native-reanimated';

const SettingRow = ({label, value, onPress, theme, destructive}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.settingRow, {borderBottomColor: theme.colors.surfaceLight}]}
    activeOpacity={0.7}>
    <Text style={[styles.settingLabel, {color: destructive ? theme.colors.error : theme.colors.text}]}>
      {label}
    </Text>
    {value && (
      <Text style={[styles.settingValue, {color: theme.colors.textSecondary}]}>
        {value}
      </Text>
    )}
  </TouchableOpacity>
);

const SectionHeader = ({title, theme}) => (
  <Text style={[styles.sectionHeader, {color: theme.colors.primary}]}>{title}</Text>
);

const SettingsScreen = () => {
  const {theme, isDark, toggleTheme} = useTheme();
  const {user, userProfile, logout} = useAuth();
  const settings = useSettings();
  const appLock = useAppLock();
  const navigation = useNavigation();
  const {selection, success} = useHaptic();

  const [nameSheetVisible, setNameSheetVisible] = useState(false);
  const [newName, setNewName] = useState(userProfile?.displayName || '');

  const handleCopyCode = useCallback(() => {
    if (userProfile?.partnerCode) {
      Clipboard.setString(userProfile.partnerCode);
      success();
      showToast('success', 'Copied', 'Partner code copied to clipboard');
    }
  }, [userProfile, success]);

  const handleSaveName = useCallback(async () => {
    if (!newName.trim()) return;
    await settings.updateDisplayName(newName.trim());
    success();
    setNameSheetVisible(false);
    showToast('success', 'Updated', 'Display name updated');
  }, [newName, settings, success]);

  const handleBiometricToggle = useCallback(async () => {
    if (appLock.isBiometricEnabled) {
      await appLock.disableBiometric();
      showToast('info', 'Disabled', 'Biometric unlock disabled');
    } else {
      const ok = await appLock.enableBiometric();
      if (ok) {
        showToast('success', 'Enabled', 'Biometric unlock enabled');
      } else {
        showToast('error', 'Failed', 'Could not enable biometric');
      }
    }
  }, [appLock]);

  const handleExport = useCallback(async () => {
    selection();
    await settings.exportUserData();
  }, [settings, selection]);

  const handleClearCache = useCallback(() => {
    Alert.alert('Clear Local Cache', 'This will clear cached data. You will not lose any synced data.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        onPress: () => {
          settings.clearLocalCache();
          success();
          showToast('success', 'Cleared', 'Local cache cleared');
        },
      },
    ]);
  }, [settings, success]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await settings.requestDeleteAccount();
              await logout();
            } catch {
              showToast('error', 'Error', 'Could not delete account. Try signing in again first.');
            }
          },
        },
      ],
    );
  }, [settings, logout]);

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, {color: theme.colors.text}]}>Settings</Text>
        </View>

        {/* Account */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <GlassCard style={styles.section}>
            <SectionHeader title="Account" theme={theme} />
            <SettingRow
              label="Display Name"
              value={userProfile?.displayName || 'Not set'}
              onPress={() => {
                setNewName(userProfile?.displayName || '');
                setNameSheetVisible(true);
              }}
              theme={theme}
            />
            <SettingRow
              label="Email"
              value={user?.email || ''}
              theme={theme}
            />
            <SettingRow
              label="Partner Code"
              value={userProfile?.partnerCode || ''}
              onPress={handleCopyCode}
              theme={theme}
            />
          </GlassCard>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <GlassCard style={styles.section}>
            <SectionHeader title="Appearance" theme={theme} />
            <View style={styles.toggleRow}>
              <AnimatedToggle label="Dark Mode" value={isDark} onToggle={toggleTheme} />
            </View>
          </GlassCard>
        </Animated.View>

        {/* Security */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <GlassCard style={styles.section}>
            <SectionHeader title="Security" theme={theme} />
            <SettingRow
              label="Change PIN"
              value="→"
              onPress={() => navigation.navigate(SCREEN_NAMES.CHANGE_PIN)}
              theme={theme}
            />
            {appLock.isBiometricAvailable && (
              <View style={styles.toggleRow}>
                <AnimatedToggle
                  label="Biometric Unlock"
                  value={appLock.isBiometricEnabled}
                  onToggle={handleBiometricToggle}
                />
              </View>
            )}
          </GlassCard>
        </Animated.View>

        {/* Privacy */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <GlassCard style={styles.section}>
            <SectionHeader title="Privacy" theme={theme} />
            <View style={styles.toggleRow}>
              <AnimatedToggle
                label="Disguise Mode"
                value={settings.disguiseMode}
                onToggle={settings.toggleDisguiseMode}
              />
            </View>
            <Text style={[styles.caption, {color: theme.colors.textSecondary}]}>
              When enabled, the app shows as "My Notes" on splash and lock screens
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Data */}
        <Animated.View entering={FadeInDown.delay(250).duration(400)}>
          <GlassCard style={styles.section}>
            <SectionHeader title="Data" theme={theme} />
            <SettingRow label="Export My Data" onPress={handleExport} theme={theme} />
            <SettingRow label="Clear Local Cache" onPress={handleClearCache} theme={theme} />
            <SettingRow label="Delete Account" onPress={handleDeleteAccount} theme={theme} destructive />
          </GlassCard>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <GlassCard style={styles.section}>
            <SectionHeader title="About" theme={theme} />
            <SettingRow label="Version" value="1.0.0" theme={theme} />
            <SettingRow
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://example.com/privacy')}
              theme={theme}
            />
            <SettingRow
              label="Terms of Service"
              onPress={() => Linking.openURL('https://example.com/terms')}
              theme={theme}
            />
          </GlassCard>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Display Name BottomSheet */}
      <BottomSheet
        visible={nameSheetVisible}
        onClose={() => setNameSheetVisible(false)}
        title="Edit Display Name">
        <View style={styles.sheetContent}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Your name"
            placeholderTextColor={theme.colors.textSecondary + '60'}
            style={[styles.nameInput, {color: theme.colors.text, borderColor: theme.colors.surfaceLight}]}
            autoFocus
          />
          <GradientButton
            label="Save"
            onPress={handleSaveName}
            disabled={!newName.trim()}
            style={styles.saveBtn}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl},
  header: {paddingHorizontal: SPACING.sm, paddingTop: SPACING.md, paddingBottom: SPACING.md},
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  title: {...TYPOGRAPHY.hero, marginTop: SPACING.sm},
  section: {marginBottom: SPACING.md},
  sectionHeader: {fontSize: normalize(13), fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: SPACING.md},
  settingRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: StyleSheet.hairlineWidth},
  settingLabel: {...TYPOGRAPHY.bodySmall, fontWeight: '500'},
  settingValue: {...TYPOGRAPHY.bodySmall},
  toggleRow: {paddingVertical: SPACING.sm},
  caption: {...TYPOGRAPHY.caption, marginTop: SPACING.xs, fontStyle: 'italic'},
  bottomSpacer: {height: SPACING.xl},
  // Sheet
  sheetContent: {paddingHorizontal: 20, paddingBottom: SPACING.lg},
  nameInput: {borderWidth: 1, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: normalize(16), marginBottom: SPACING.md},
  saveBtn: {width: '100%'},
});

export default SettingsScreen;
