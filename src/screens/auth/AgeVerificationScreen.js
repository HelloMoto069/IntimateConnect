import React, {useState} from 'react';
import {View, Text, Platform, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useAuth} from '@context/AuthContext';
import {useTheme} from '@context/ThemeContext';
import {GradientButton} from '@components/common';
import {showToast} from '@components/common/Toast';
import {validateAge} from '@utils/validators';
import {formatDate, getMaxDateForAge, getMinDate} from '@utils/dateUtils';
import {MIN_AGE} from '@utils/constants';

const AgeVerificationScreen = () => {
  const {theme} = useTheme();
  const {verifyAge} = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleContinue = () => {
    const result = validateAge(selectedDate);
    if (!result.valid) {
      showToast('error', 'Age Verification Failed', result.error);
      return;
    }
    verifyAge(selectedDate);
  };

  return (
    <LinearGradient
      colors={theme.gradients.cool}
      style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Age</Text>
        <Text style={styles.subtitle}>
          This app contains adult content.{'\n'}You must be {MIN_AGE} or older
          to continue.
        </Text>

        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>Date of Birth</Text>

          {Platform.OS === 'android' && (
            <GradientButton
              title={formatDate(selectedDate, 'long')}
              onPress={() => setShowPicker(true)}
              variant="outline"
              style={styles.dateButton}
            />
          )}

          {showPicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={getMinDate()}
              textColor="#FFFFFF"
              themeVariant="dark"
            />
          )}
        </View>

        <GradientButton
          title="Continue"
          onPress={handleContinue}
          size="lg"
          style={styles.continueButton}
          accessibilityLabel="Verify age and continue"
        />

        <Text style={styles.disclaimer}>
          We don't store your date of birth.{'\n'}Only your verification status
          is saved.
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0B0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  dateSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  dateLabel: {
    fontSize: 14,
    color: '#A0A0B0',
    marginBottom: 12,
  },
  dateButton: {
    width: '100%',
  },
  continueButton: {
    width: '100%',
  },
  disclaimer: {
    fontSize: 12,
    color: '#A0A0B0',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
    opacity: 0.7,
  },
});

export default AgeVerificationScreen;
