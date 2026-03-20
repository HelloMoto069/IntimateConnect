import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import GradientButton from './GradientButton';

const EmptyState = ({title, subtitle, actionLabel, onAction, style}) => {
  const {theme} = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, {color: theme.colors.text}]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <GradientButton
          title={actionLabel}
          onPress={onAction}
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
});

export default EmptyState;
