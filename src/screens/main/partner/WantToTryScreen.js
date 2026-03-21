import React, {useState, useCallback, useMemo} from 'react';
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
import {useContent} from '@context/ContentContext';
import {usePartner} from '@hooks/usePartner';
import {useHaptic} from '@hooks/useHaptic';
import {SPACING, BORDER_RADIUS, TYPOGRAPHY} from '@utils/constants';
import {normalize} from '@utils/helpers';
import SearchBar from '@components/common/SearchBar';
import BottomSheet from '@components/common/BottomSheet';
import EmptyState from '@components/common/EmptyState';
import FilterChips from '@components/common/FilterChips';
import {WantToTryItem} from '@components/partner';
import Animated, {FadeInDown} from 'react-native-reanimated';

const TAB_OPTIONS = [
  {value: 'to-try', label: 'To Try'},
  {value: 'tried', label: 'Tried Together'},
];

const WantToTryScreen = () => {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const couple = usePartner();
  const {positions} = useContent();
  const {selection} = useHaptic();

  const [activeTab, setActiveTab] = useState('to-try');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Build position lookup
  const positionMap = useMemo(() => {
    const map = {};
    positions.forEach(p => {
      map[p.id] = p;
    });
    return map;
  }, [positions]);

  // Get name for addedBy uid
  const getAddedByName = uid => {
    if (!couple.partner) return 'Unknown';
    if (uid === couple.partner.uid) return couple.partner.displayName;
    return 'You';
  };

  const displayList =
    activeTab === 'to-try' ? couple.wantToTryList : couple.triedTogetherList;

  // Position picker search
  const filteredPositions = useMemo(() => {
    if (!searchQuery) return positions.slice(0, 30);
    const q = searchQuery.toLowerCase();
    return positions
      .filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.category || []).some(c => c.toLowerCase().includes(q)),
      )
      .slice(0, 30);
  }, [positions, searchQuery]);

  const handleAddPosition = useCallback(
    positionId => {
      selection();
      couple.addToWantToTry(positionId);
      setPickerVisible(false);
      setSearchQuery('');
    },
    [couple, selection],
  );

  const renderItem = ({item, index}) => {
    const position = positionMap[item.positionId];
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
        <WantToTryItem
          item={item}
          positionName={position?.name}
          addedByName={getAddedByName(item.addedBy)}
          onMarkTried={activeTab === 'to-try' ? couple.markAsTried : undefined}
          onRemove={couple.removeFromWantToTry}
        />
      </Animated.View>
    );
  };

  const renderPickerItem = ({item}) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleAddPosition(item.id)}
      style={[styles.pickerItem, {borderBottomColor: theme.colors.surfaceLight}]}>
      <Text style={[styles.pickerName, {color: theme.colors.text}]}>
        {item.name}
      </Text>
      <Text style={[styles.pickerMeta, {color: theme.colors.textSecondary}]}>
        {(item.category || []).join(' • ')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, {color: theme.colors.primary}]}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPickerVisible(true)}
            style={[styles.addBtn, {backgroundColor: theme.colors.primary + '20'}]}>
            <Text style={[styles.addText, {color: theme.colors.primary}]}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.title, {color: theme.colors.text}]}>Want to Try</Text>
      </View>

      {/* Tabs */}
      <View style={styles.filterRow}>
        <FilterChips
          options={TAB_OPTIONS}
          selected={activeTab}
          onSelect={tab => setActiveTab(tab || 'to-try')}
        />
      </View>

      {/* List */}
      <FlatList
        data={displayList}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={activeTab === 'to-try' ? 'Nothing Yet' : 'No Tried Positions'}
            subtitle={
              activeTab === 'to-try'
                ? 'Tap "+ Add" to add positions you want to try together.'
                : "Positions you've tried together will appear here."
            }
          />
        }
      />

      {/* Position Picker BottomSheet */}
      <BottomSheet
        visible={pickerVisible}
        onClose={() => {
          setPickerVisible(false);
          setSearchQuery('');
        }}
        title="Add Position">
        <View style={styles.pickerContent}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search positions..."
            style={styles.pickerSearch}
          />
          <FlatList
            data={filteredPositions}
            renderItem={renderPickerItem}
            keyExtractor={item => item.id}
            style={styles.pickerList}
            showsVerticalScrollIndicator={false}
          />
        </View>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: SPACING.sm,
  },
  backText: {
    fontSize: normalize(15),
    fontWeight: '600',
  },
  addBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  addText: {
    fontSize: normalize(13),
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginTop: SPACING.sm,
  },
  filterRow: {
    paddingVertical: SPACING.sm,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xxl,
    gap: SPACING.sm,
  },
  // Picker
  pickerContent: {
    paddingHorizontal: SPACING.md,
    maxHeight: 400,
  },
  pickerSearch: {
    marginBottom: SPACING.md,
  },
  pickerList: {
    maxHeight: 320,
  },
  pickerItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  pickerMeta: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
});

export default WantToTryScreen;
