import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useTrackerContext} from '@context/TrackerContext';
import {useHaptic} from '@hooks/useHaptic';
import {GOAL_CATEGORIES, SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import FilterChips from '@components/common/FilterChips';
import BottomSheet from '@components/common/BottomSheet';
import GradientButton from '@components/common/GradientButton';
import EmptyState from '@components/common/EmptyState';
import {GoalCard} from '@components/tracker';
import Animated, {FadeInDown} from 'react-native-reanimated';

const GoalsScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const tracker = useTrackerContext();
  const {selection, success} = useHaptic();

  const [categoryFilter, setCategoryFilter] = useState(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [progressVisible, setProgressVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('intimacy');
  const [newTargetDate, setNewTargetDate] = useState('');

  const categoryOptions = GOAL_CATEGORIES.map(c => ({value: c.id, label: `${c.icon} ${c.label}`}));

  const filteredGoals = categoryFilter
    ? tracker.goals.filter(g => g.category === categoryFilter)
    : tracker.goals;

  const handleCreate = useCallback(async () => {
    if (!newTitle.trim()) return;
    success();
    await tracker.addGoal(newTitle.trim(), newCategory, newTargetDate || null);
    setNewTitle('');
    setNewCategory('intimacy');
    setNewTargetDate('');
    setCreateVisible(false);
  }, [newTitle, newCategory, newTargetDate, tracker, success]);

  const handleGoalPress = useCallback(goal => {
    selection();
    setSelectedGoal(goal);
    setProgressVisible(true);
  }, [selection]);

  const handleUpdateProgress = useCallback(
    async increment => {
      if (!selectedGoal) return;
      const newProgress = Math.min(selectedGoal.progress + increment, 100);
      await tracker.updateGoalProgress(selectedGoal.id, newProgress);
      setSelectedGoal({...selectedGoal, progress: newProgress});
    },
    [selectedGoal, tracker],
  );

  const handleComplete = useCallback(async () => {
    if (!selectedGoal) return;
    success();
    await tracker.completeGoal(selectedGoal.id);
    setProgressVisible(false);
    setSelectedGoal(null);
  }, [selectedGoal, tracker, success]);

  const handleDelete = useCallback(async () => {
    if (!selectedGoal) return;
    await tracker.deleteGoal(selectedGoal.id);
    setProgressVisible(false);
    setSelectedGoal(null);
  }, [selectedGoal, tracker]);

  const renderItem = ({item, index}) => (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <GoalCard goal={item} onPress={() => handleGoalPress(item)} />
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCreateVisible(true)}
            style={[styles.addBtn, {backgroundColor: theme.colors.primary + '20'}]}>
            <Text style={[styles.addText, {color: theme.colors.primary}]}>+ New</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, {color: theme.colors.text}]}>Wellness Goals</Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {tracker.goalStats.completed} completed • {tracker.goalStats.inProgress} in progress
        </Text>
      </View>

      <View style={styles.filterRow}>
        <FilterChips
          options={categoryOptions}
          selected={categoryFilter}
          onSelect={setCategoryFilter}
        />
      </View>

      <FlatList
        data={filteredGoals}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No Goals Yet"
            subtitle="Set your first wellness goal to start tracking progress."
            actionLabel="Create Goal"
            onAction={() => setCreateVisible(true)}
          />
        }
      />

      {/* Create Goal BottomSheet */}
      <BottomSheet
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        title="New Goal">
        <View style={styles.sheetContent}>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Goal title..."
            placeholderTextColor={theme.colors.textSecondary + '60'}
            style={[styles.input, {color: theme.colors.text, borderColor: theme.colors.surfaceLight}]}
          />
          <Text style={[styles.sheetLabel, {color: theme.colors.textSecondary}]}>Category</Text>
          <FilterChips
            options={categoryOptions}
            selected={newCategory}
            onSelect={val => setNewCategory(val || 'intimacy')}
          />
          <TextInput
            value={newTargetDate}
            onChangeText={setNewTargetDate}
            placeholder="Target date (YYYY-MM-DD)"
            placeholderTextColor={theme.colors.textSecondary + '60'}
            style={[styles.input, styles.dateInput, {color: theme.colors.text, borderColor: theme.colors.surfaceLight}]}
          />
          <GradientButton
            label="Create Goal"
            onPress={handleCreate}
            disabled={!newTitle.trim()}
            style={styles.createBtn}
          />
        </View>
      </BottomSheet>

      {/* Progress BottomSheet */}
      <BottomSheet
        visible={progressVisible}
        onClose={() => setProgressVisible(false)}
        title={selectedGoal?.title}>
        {selectedGoal && (
          <View style={styles.sheetContent}>
            <Text style={[styles.progressLabel, {color: theme.colors.primary}]}>
              Progress: {selectedGoal.progress}%
            </Text>
            <View style={styles.progressActions}>
              {[10, 25, 50].map(inc => (
                <TouchableOpacity
                  key={inc}
                  onPress={() => handleUpdateProgress(inc)}
                  style={[styles.incBtn, {backgroundColor: theme.colors.primary + '20'}]}>
                  <Text style={[styles.incText, {color: theme.colors.primary}]}>+{inc}%</Text>
                </TouchableOpacity>
              ))}
            </View>
            {!selectedGoal.isCompleted && (
              <GradientButton
                label="Mark Complete"
                onPress={handleComplete}
                style={styles.completeBtn}
              />
            )}
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Text style={[styles.deleteText, {color: theme.colors.error}]}>Delete Goal</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  addBtn: {paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full},
  addText: {fontSize: normalize(13), fontWeight: '600'},
  title: {...TYPOGRAPHY.hero, marginTop: SPACING.sm},
  subtitle: {...TYPOGRAPHY.bodySmall, marginTop: SPACING.xs},
  filterRow: {paddingVertical: SPACING.sm},
  list: {paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl, gap: SPACING.md},
  // BottomSheet
  sheetContent: {paddingHorizontal: 20, paddingBottom: SPACING.lg},
  sheetLabel: {...TYPOGRAPHY.caption, fontWeight: '600', marginTop: SPACING.md, marginBottom: SPACING.sm},
  input: {borderWidth: 1, borderRadius: BORDER_RADIUS.md, padding: SPACING.md, fontSize: normalize(15), marginBottom: SPACING.md},
  dateInput: {marginTop: SPACING.sm},
  createBtn: {marginTop: SPACING.md, width: '100%'},
  progressLabel: {fontSize: normalize(20), fontWeight: '700', textAlign: 'center', marginBottom: SPACING.lg},
  progressActions: {flexDirection: 'row', justifyContent: 'center', gap: SPACING.md, marginBottom: SPACING.lg},
  incBtn: {paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.full},
  incText: {fontSize: normalize(14), fontWeight: '600'},
  completeBtn: {width: '100%'},
  deleteBtn: {alignItems: 'center', paddingVertical: SPACING.md, marginTop: SPACING.sm},
  deleteText: {fontSize: normalize(14), fontWeight: '600'},
});

export default GoalsScreen;
