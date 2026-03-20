import React from 'react';
import {View, TextInput, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {BORDER_RADIUS} from '@utils/constants';

const SearchBar = ({value, onChangeText, placeholder = 'Search...', onClear, style}) => {
  const {theme} = useTheme();

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceLight},
        style,
      ]}>
      <Text style={[styles.icon, {color: theme.colors.textSecondary}]}>
        Search
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary + '80'}
        style={[styles.input, {color: theme.colors.text}]}
        autoCorrect={false}
        accessibilityLabel="Search"
      />
      {value ? (
        <TouchableOpacity
          onPress={() => {
            onChangeText?.('');
            onClear?.();
          }}
          accessibilityLabel="Clear search"
          accessibilityRole="button">
          <Text style={{color: theme.colors.textSecondary, fontSize: 16}}>
            X
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
  },
  icon: {
    fontSize: 14,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
});

export default SearchBar;
