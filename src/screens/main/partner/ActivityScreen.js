import React, {useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {usePartner} from '@hooks/usePartner';
import {SPACING, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import {ActivityItem} from '@components/partner';
import EmptyState from '@components/common/EmptyState';
import Animated, {FadeInDown} from 'react-native-reanimated';

const ActivityScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const couple = usePartner();

  const handleEndReached = useCallback(() => {
    if (couple.hasMoreActivity) {
      couple.loadMoreActivity();
    }
  }, [couple]);

  const renderItem = ({item, index}) => (
    <Animated.View entering={FadeInDown.delay(index * 30).duration(300)}>
      <ActivityItem
        activity={item}
        isLast={index === couple.activityFeed.length - 1}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Couple Activity
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Your journey together
        </Text>
      </View>

      <FlatList
        data={couple.activityFeed}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || `activity-${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            title="No Activity Yet"
            subtitle="Your couple activity will appear here as you explore together."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: normalize(15),
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginTop: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: SPACING.xs,
  },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
});

export default ActivityScreen;
