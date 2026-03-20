import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {GradientButton, EncryptedInput} from '@components/common';
import {showToast} from '@components/common/Toast';
import {
  validateEmail,
  validatePassword,
  validateDisplayName,
  validateConfirmPassword,
} from '@utils/validators';

const SignUpScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {signUp} = useAuth();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});

  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmRef = useRef();

  const getStrengthColor = strength => {
    const colors = ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'];
    return colors[Math.min(strength, 4)] || colors[0];
  };

  const handleSignUp = async () => {
    const nameResult = validateDisplayName(displayName);
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);

    const newErrors = {};
    if (!nameResult.valid) newErrors.displayName = nameResult.error;
    if (!emailResult.valid) newErrors.email = emailResult.error;
    if (!passwordResult.valid) newErrors.password = passwordResult.error;
    if (!confirmResult.valid) newErrors.confirmPassword = confirmResult.error;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await signUp(email.trim(), password, displayName.trim());
      showToast('success', 'Welcome!', 'Account created successfully');
    } catch (error) {
      let message = 'Something went wrong. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak.';
      }
      showToast('error', 'Sign Up Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = validatePassword(password).strength || 0;

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Create Account
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Join IntimateConnect for free
        </Text>

        <EncryptedInput
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Your name"
          autoCapitalize="words"
          error={errors.displayName}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <EncryptedInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          error={errors.email}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <EncryptedInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min 8 characters"
          secureTextEntry
          error={errors.password}
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
        />

        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBar}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor: getStrengthColor(passwordStrength),
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.strengthText,
                {color: getStrengthColor(passwordStrength)},
              ]}>
              {passwordStrength <= 1
                ? 'Weak'
                : passwordStrength <= 3
                ? 'Medium'
                : 'Strong'}
            </Text>
          </View>
        )}

        <EncryptedInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
          error={errors.confirmPassword}
          returnKeyType="done"
          onSubmitEditing={handleSignUp}
        />

        <GradientButton
          title="Sign Up"
          onPress={handleSignUp}
          loading={loading}
          size="lg"
          style={styles.signUpButton}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.colors.textSecondary}]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="link"
            accessibilityLabel="Go to login">
            <Text style={[styles.footerLink, {color: theme.colors.primary}]}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 16,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginRight: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  signUpButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignUpScreen;
