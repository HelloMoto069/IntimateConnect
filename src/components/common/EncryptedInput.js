import React, {useState, useRef} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '@context/ThemeContext';
import {BORDER_RADIUS} from '@utils/constants';

const EncryptedInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  label,
  error,
  autoCapitalize = 'none',
  keyboardType = 'default',
  returnKeyType,
  onSubmitEditing,
  editable = true,
  maxLength,
  style,
  accessibilityLabel,
}) => {
  const {theme} = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const inputRef = useRef(null);
  const borderColor = useSharedValue(theme.colors.surfaceLight);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(theme.colors.primary, {duration: 200});
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(
      error ? theme.colors.error : theme.colors.surfaceLight,
      {duration: 200},
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, {color: theme.colors.textSecondary}]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {backgroundColor: theme.colors.surface},
          animatedBorderStyle,
          error && {borderColor: theme.colors.error},
        ]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary + '80'}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[styles.input, {color: theme.colors.text}]}
          accessibilityLabel={accessibilityLabel || label || placeholder}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsSecure(!isSecure)}
            style={styles.eyeButton}
            accessibilityLabel={
              isSecure ? 'Show password' : 'Hide password'
            }
            accessibilityRole="button">
            <Text style={{color: theme.colors.textSecondary, fontSize: 16}}>
              {isSecure ? '👁' : '👁‍🗨'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Text style={[styles.error, {color: theme.colors.error}]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  eyeButton: {
    padding: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default EncryptedInput;
