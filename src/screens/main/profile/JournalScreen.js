import React, {useState, useCallback} from 'react';
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
import {useTrackerContext} from '@context/TrackerContext';
import {SCREEN_NAMES, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import SearchBar from '@components/common/SearchBar';
import EmptyState from '@components/common/EmptyState';
import {JournalEntryCard} from '@components/tracker';
import Animated, {FadeInDown} from 'react-native-reanimated';

const JournalScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const tracker = useTrackerContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = searchQuery
    ? tracker.journalEntries.filter(e => {
        const q = searchQuery.toLowerCase();
        return (
          e.title?.toLowerCase().includes(q) ||
          (e.tags || []).some(t => t.toLowerCase().includes(q))
        );
      })
    : tracker.journalEntries;

  const handleEntryPress = useCallback(
    entryId => {
      navigation.navigate(SCREEN_NAMES.TRACKER_JOURNAL_EDIT, {entryId});
    },
    [navigation],
  );

  const handleCreate = useCallback(() => {
    navigation.navigate(SCREEN_NAMES.TRACKER_JOURNAL_EDIT);
  }, [navigation]);

  const renderItem = ({item, index}) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <JournalEntryCard
        entry={item}
        onPress={() => handleEntryPress(item.id)}
      />
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreate}
            style={[styles.addBtn, {backgroundColor: theme.colors.primary + '20'}]}>
            <Text style={[styles.addText, {color: theme.colors.primary}]}>+ New</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, {color: theme.colors.text}]}>Journal</Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {tracker.journalCount} {tracker.journalCount === 1 ? 'entry' : 'entries'}
        </Text>
      </View>

      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by title or tag..."
        />
      </View>

      <FlatList
        data={filteredEntries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="Your Private Journal Awaits"
            subtitle="Start writing your first entry — it's encrypted and only you can read it."
            actionLabel="New Entry"
            onAction={handleCreate}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  addBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  addText: {fontSize: normalize(13), fontWeight: '600'},
  title: {...TYPOGRAPHY.hero, marginTop: SPACING.sm},
  subtitle: {...TYPOGRAPHY.bodySmall, marginTop: SPACING.xs},
  searchRow: {paddingHorizontal: SPACING.md, marginBottom: SPACING.md},
  list: {paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.md},
});

export default JournalScreen;
