import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {usePartner} from '@hooks/usePartner';
import {SCREEN_NAMES, SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {
  PartnerCodeCard,
  CodeEntryCard,
  PartnerInfoCard,
  CoupleStatsCard,
  QuickActionGrid,
  ActivityItem,
  DisconnectButton,
} from '@components/partner';

const PartnerScreen = () => {
  const {theme} = useTheme();
  const couple = usePartner();
  const navigation = useNavigation();

  if (couple.isConnected) {
    return (
      <DashboardView
        couple={couple}
        theme={theme}
        navigation={navigation}
      />
    );
  }

  return (
    <ConnectView couple={couple} theme={theme} />
  );
};

// ─── Not Connected — Connect UI ─────────────────────────
const ConnectView = ({couple, theme}) => {
  const [error, setError] = useState('');

  const handleConnect = useCallback(
    async code => {
      setError('');
      const result = await couple.connectByCode(code);
      if (!result.success) {
        setError(result.error || 'Connection failed');
      }
    },
    [couple],
  );

  const handleRegenerate = useCallback(async () => {
    await couple.regenerateCode();
  }, [couple]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Couple Connect
          </Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            Link with your partner
          </Text>
        </View>

        {/* Your Code */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <PartnerCodeCard
            code={couple.partnerCode}
            onRegenerate={handleRegenerate}
          />
        </Animated.View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, {backgroundColor: theme.colors.surfaceLight}]} />
          <Text style={[styles.dividerText, {color: theme.colors.textSecondary}]}>
            OR
          </Text>
          <View style={[styles.dividerLine, {backgroundColor: theme.colors.surfaceLight}]} />
        </View>

        {/* Enter Partner Code */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <CodeEntryCard
            onConnect={handleConnect}
            isConnecting={couple.isConnecting}
            error={error}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Connected — Dashboard ──────────────────────────────
const DashboardView = ({couple, theme, navigation}) => {
  const handleNavigate = useCallback(
    screen => {
      navigation.navigate(screen);
    },
    [navigation],
  );

  const recentActivity = couple.activityFeed.slice(0, 3);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, {color: theme.colors.text}]}>
            Your Connection
          </Text>
        </View>

        {/* Partner Info */}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <PartnerInfoCard partner={couple.partner} />
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <CoupleStatsCard stats={couple.coupleStats} />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
          <QuickActionGrid onNavigate={handleNavigate} />
        </Animated.View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                Recent Activity
              </Text>
              <Text
                style={[styles.viewAll, {color: theme.colors.primary}]}
                onPress={() => handleNavigate(SCREEN_NAMES.PARTNER_ACTIVITY)}>
                View All
              </Text>
            </View>
            {recentActivity.map((activity, index) => (
              <ActivityItem
                key={activity.id || index}
                activity={activity}
                isLast={index === recentActivity.length - 1}
              />
            ))}
          </Animated.View>
        )}

        {/* Disconnect */}
        <View style={styles.disconnectSection}>
          <DisconnectButton onDisconnect={couple.disconnect} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.hero,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.xs,
  },
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: normalize(13),
    fontWeight: '600',
  },
  // Dashboard sections
  section: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
  },
  viewAll: {
    fontSize: normalize(13),
    fontWeight: '600',
  },
  disconnectSection: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
  },
});

export default PartnerScreen;
