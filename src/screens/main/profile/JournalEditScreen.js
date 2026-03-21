import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useTrackerContext} from '@context/TrackerContext';
import {useHaptic} from '@hooks/useHaptic';
import {
  WELLNESS_MOODS,
  JOURNAL_TAGS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} from '@utils/constants';
import {normalize} from '@utils/helpers';
import GradientButton from '@components/common/GradientButton';
import FilterChips from '@components/common/FilterChips';
import {MoodSelector} from '@components/health';

const JournalEditScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const tracker = useTrackerContext();
  const {success} = useHaptic();

  const entryId = route.params?.entryId;
  const isEdit = !!entryId;

  const existing = isEdit ? tracker.getDecryptedEntry(entryId) : null;

  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [moodTag, setMoodTag] = useState(existing?.moodTag || null);
  const [tags, setTags] = useState(existing?.tags || []);
  const [saving, setSaving] = useState(false);

  const tagOptions = JOURNAL_TAGS.map(t => ({value: t, label: t}));

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    setSaving(true);

    if (isEdit) {
      await tracker.updateJournalEntry(entryId, {
        title: title.trim(),
        content: content.trim(),
        moodTag,
        tags,
      });
    } else {
      await tracker.addJournalEntry(
        title.trim() || 'Untitled',
        content.trim(),
        moodTag,
        tags,
      );
    }

    success();
    setSaving(false);
    navigation.goBack();
  }, [title, content, moodTag, tags, isEdit, entryId, tracker, success, navigation]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete Entry', 'This cannot be undone. Delete this journal entry?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await tracker.deleteJournalEntry(entryId);
          navigation.goBack();
        },
      },
    ]);
  }, [entryId, tracker, navigation]);

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: theme.colors.text}]}>
            {isEdit ? 'Edit Entry' : 'New Entry'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Title */}
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Title"
            placeholderTextColor={theme.colors.textSecondary + '60'}
            style={[
              styles.titleInput,
              {color: theme.colors.text, borderBottomColor: theme.colors.surfaceLight},
            ]}
          />

          {/* Content */}
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Write your thoughts..."
            placeholderTextColor={theme.colors.textSecondary + '60'}
            style={[
              styles.contentInput,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.surfaceLight,
              },
            ]}
            multiline
            textAlignVertical="top"
          />

          {/* Mood Tag */}
          <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
            How are you feeling? (optional)
          </Text>
          <MoodSelector
            moods={WELLNESS_MOODS}
            selectedId={moodTag}
            onSelect={id => setMoodTag(moodTag === id ? null : id)}
          />

          {/* Tags */}
          <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
            Tags
          </Text>
          <FilterChips
            options={tagOptions}
            selected={tags}
            onSelect={setTags}
            multiple
          />

          {/* Actions */}
          <View style={styles.actions}>
            <GradientButton
              label={saving ? 'Saving...' : 'Save Entry'}
              onPress={handleSave}
              disabled={saving || (!title.trim() && !content.trim())}
              style={styles.saveBtn}
            />
            {isEdit && (
              <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                <Text style={[styles.deleteText, {color: theme.colors.error}]}>
                  Delete Entry
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  flex: {flex: 1},
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {paddingVertical: SPACING.sm},
  backText: {fontSize: normalize(15), fontWeight: '600'},
  headerTitle: {...TYPOGRAPHY.h2, marginTop: SPACING.sm},
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  titleInput: {
    fontSize: normalize(22),
    fontWeight: '700',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    marginBottom: SPACING.md,
  },
  contentInput: {
    fontSize: normalize(15),
    lineHeight: 24,
    minHeight: 180,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  actions: {
    marginTop: SPACING.xl,
  },
  saveBtn: {
    width: '100%',
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  deleteText: {
    fontSize: normalize(14),
    fontWeight: '600',
  },
});

export default JournalEditScreen;
