import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';

const GamesScreen = () => {
  const {theme} = useTheme();
  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.title, {color: theme.colors.text}]}>Games</Text>
      <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
        Couples Games — Coming in Phase 3
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  title: {fontSize: 26, fontWeight: '700', marginBottom: 8},
  subtitle: {fontSize: 16},
});

export default GamesScreen;
