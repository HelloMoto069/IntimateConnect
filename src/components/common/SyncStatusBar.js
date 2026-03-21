import React, {useEffect} from 'react';
import {Text, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useOfflineSync} from '@hooks/useOfflineSync';
import {normalize} from '@utils/helpers';

const SyncStatusBar = () => {
  const {isOnline, isSyncing, pendingSync} = useOfflineSync();
  const height = useSharedValue(0);

  const showBar = !isOnline || isSyncing || pendingSync > 0;

  useEffect(() => {
    height.value = withTiming(showBar ? 28 : 0, {duration: 300});
  }, [showBar, height]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
    overflow: 'hidden',
  }));

  let backgroundColor = '#F44336'; // red — offline
  let text = 'No connection — changes saved locally';

  if (isOnline && isSyncing) {
    backgroundColor = '#FF9800'; // amber — syncing
    text = 'Syncing...';
  } else if (isOnline && pendingSync > 0) {
    backgroundColor = '#FF9800';
    text = `${pendingSync} pending — will sync shortly`;
  }

  return (
    <Animated.View style={[styles.container, {backgroundColor}, animatedStyle]}>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: normalize(11),
    fontWeight: '600',
  },
});

export default SyncStatusBar;
