import React, {useState} from 'react';
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
import {validateEmail} from '@utils/validators';
import {resetPassword} from '@api/firebase/auth';

const LoginScreen = ({navigation}) => {
  const {theme} = useTheme();
  const {signIn} = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const emailResult = validateEmail(email);
    const newErrors = {};
    if (!emailResult.valid) newErrors.email = emailResult.error;
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      let message = 'Something went wrong. Please try again.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      }
      showToast('error', 'Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      showToast('info', 'Enter Email', 'Please enter your email address first.');
      return;
    }
    try {
      await resetPassword(email.trim());
      showToast(
        'success',
        'Email Sent',
        'Check your inbox for password reset instructions.',
      );
    } catch {
      showToast('error', 'Error', 'Could not send reset email. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, {color: theme.colors.text}]}>
          Welcome Back
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Sign in to continue
        </Text>

        <EncryptedInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
          keyboardType="email-address"
          error={errors.email}
          returnKeyType="next"
        />

        <EncryptedInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          secureTextEntry
          error={errors.password}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotButton}
          accessibilityRole="link"
          accessibilityLabel="Forgot password">
          <Text style={[styles.forgotText, {color: theme.colors.primary}]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <GradientButton
          title="Log In"
          onPress={handleLogin}
          loading={loading}
          size="lg"
          style={styles.loginButton}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, {color: theme.colors.textSecondary}]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            accessibilityRole="link"
            accessibilityLabel="Go to sign up">
            <Text style={[styles.footerLink, {color: theme.colors.primary}]}>
              Sign Up
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
    paddingTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
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

export default LoginScreen;
