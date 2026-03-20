import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {useContent} from '@context/ContentContext';
import {useHaptic} from '@hooks/useHaptic';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import SearchBar from '@components/common/SearchBar';
import BottomSheet from '@components/common/BottomSheet';
import Animated, {FadeInDown} from 'react-native-reanimated';

const GlossaryScreen = () => {
  const {theme} = useTheme();
  const {health} = useContent();
  const navigation = useNavigation();
  const {selection} = useHaptic();
  const sectionListRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Build sections from alphabet index
  const sections = health.alphabetIndex
    .map(letter => {
      const terms = searchQuery
        ? health.filteredGlossary.filter(
            t => t.term.charAt(0).toUpperCase() === letter,
          )
        : health.getTermsByLetter(letter);
      return {title: letter, data: terms};
    })
    .filter(s => s.data.length > 0);

  const handleSearch = useCallback(
    query => {
      setSearchQuery(query);
      health.searchGlossary(query);
    },
    [health],
  );

  const handleTermPress = useCallback(
    term => {
      selection();
      setSelectedTerm(term);
      setSheetVisible(true);
    },
    [selection],
  );

  const handleRelatedTermPress = useCallback(
    termId => {
      const term = health.getTermById(termId);
      if (term) {
        setSelectedTerm(term);
      }
    },
    [health],
  );

  const handleLetterPress = useCallback(
    (letter, index) => {
      selection();
      // Find section index for this letter
      const sectionIndex = sections.findIndex(s => s.title === letter);
      if (sectionIndex >= 0 && sectionListRef.current) {
        sectionListRef.current.scrollToLocation({
          sectionIndex,
          itemIndex: 0,
          animated: true,
          viewOffset: 60,
        });
      }
    },
    [selection, sections],
  );

  const renderSectionHeader = ({section}) => (
    <View style={[styles.sectionHeader, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.sectionLetter, {color: theme.colors.primary}]}>
        {section.title}
      </Text>
    </View>
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleTermPress(item)}
      style={[styles.termRow, {borderBottomColor: theme.colors.surfaceLight}]}>
      <Text style={[styles.termName, {color: theme.colors.text}]}>
        {item.term}
      </Text>
      <Text
        style={[styles.termDef, {color: theme.colors.textSecondary}]}
        numberOfLines={1}>
        {item.definition}
      </Text>
    </TouchableOpacity>
  );

  const CATEGORY_LABELS = {
    anatomy: 'Anatomy',
    health: 'Health',
    psychology: 'Psychology',
    practices: 'Practices',
    communication: 'Communication',
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Health Glossary
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {health.glossaryTerms.length} terms
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search terms..."
        />
      </View>

      {/* Alphabet Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alphabetBar}>
        {health.alphabetIndex.map((letter, i) => {
          const hasTerms = sections.some(s => s.title === letter);
          return (
            <TouchableOpacity
              key={letter}
              onPress={() => handleLetterPress(letter, i)}
              disabled={!hasTerms}
              style={[
                styles.letterBtn,
                !hasTerms && {opacity: 0.3},
              ]}>
              <Text
                style={[
                  styles.letterText,
                  {color: hasTerms ? theme.colors.primary : theme.colors.textSecondary},
                ]}>
                {letter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Terms List */}
      <SectionList
        ref={sectionListRef}
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>
              No terms found
            </Text>
          </View>
        }
      />

      {/* Term Detail BottomSheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={selectedTerm?.term}>
        {selectedTerm && (
          <View style={styles.sheetContent}>
            {selectedTerm.category && (
              <View
                style={[
                  styles.sheetCategoryBadge,
                  {backgroundColor: theme.colors.primary + '15'},
                ]}>
                <Text style={[styles.sheetCategoryText, {color: theme.colors.primary}]}>
                  {CATEGORY_LABELS[selectedTerm.category] || selectedTerm.category}
                </Text>
              </View>
            )}
            <Text style={[styles.sheetDefinition, {color: theme.colors.text}]}>
              {selectedTerm.definition}
            </Text>

            {/* Related Terms */}
            {selectedTerm.relatedTerms?.length > 0 && (
              <View style={styles.relatedSection}>
                <Text style={[styles.relatedLabel, {color: theme.colors.textSecondary}]}>
                  Related Terms
                </Text>
                <View style={styles.relatedChips}>
                  {selectedTerm.relatedTerms.map(termId => {
                    const related = health.getTermById(termId);
                    if (!related) return null;
                    return (
                      <TouchableOpacity
                        key={termId}
                        onPress={() => handleRelatedTermPress(termId)}
                        style={[
                          styles.relatedChip,
                          {backgroundColor: theme.colors.surfaceLight},
                        ]}>
                        <Text style={[styles.relatedChipText, {color: theme.colors.primary}]}>
                          {related.term}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </BottomSheet>
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
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: normalize(15),
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.hero,
    marginTop: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    marginTop: SPACING.xs,
  },
  searchRow: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  // Alphabet bar
  alphabetBar: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 2,
  },
  letterBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: normalize(13),
    fontWeight: '700',
  },
  // Section list
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  sectionLetter: {
    fontSize: normalize(16),
    fontWeight: '800',
  },
  termRow: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  termName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginBottom: 2,
  },
  termDef: {
    ...TYPOGRAPHY.caption,
  },
  emptyContainer: {
    paddingTop: SPACING.xxl * 2,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
  },
  // BottomSheet content
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: SPACING.lg,
  },
  sheetCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  sheetCategoryText: {
    fontSize: normalize(12),
    fontWeight: '600',
  },
  sheetDefinition: {
    ...TYPOGRAPHY.body,
    lineHeight: 26,
  },
  relatedSection: {
    marginTop: SPACING.lg,
  },
  relatedLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  relatedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  relatedChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  relatedChipText: {
    fontSize: normalize(13),
    fontWeight: '500',
  },
});

export default GlossaryScreen;
