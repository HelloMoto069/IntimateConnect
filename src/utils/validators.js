import {MIN_AGE, PIN_LENGTH} from './constants';
import {calculateAge} from './dateUtils';

export const validateEmail = email => {
  if (!email || !email.trim()) {
    return {valid: false, error: 'Email is required'};
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {valid: false, error: 'Please enter a valid email address'};
  }
  return {valid: true, error: null};
};

export const validatePassword = password => {
  if (!password) {
    return {valid: false, error: 'Password is required', strength: 0};
  }
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters',
      strength: 1,
    };
  }

  let strength = 1;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  if (password.length >= 12) strength++;

  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter',
      strength,
    };
  }
  if (!hasNumber) {
    return {
      valid: false,
      error: 'Password must contain at least one number',
      strength,
    };
  }
  if (!hasSpecial) {
    return {
      valid: false,
      error: 'Password must contain at least one special character',
      strength,
    };
  }

  return {valid: true, error: null, strength};
};

export const validateAge = dateOfBirth => {
  if (!dateOfBirth) {
    return {valid: false, age: 0, error: 'Date of birth is required'};
  }

  const age = calculateAge(dateOfBirth);

  if (age < MIN_AGE) {
    return {
      valid: false,
      age,
      error: `You must be at least ${MIN_AGE} years old to use this app`,
    };
  }

  return {valid: true, age, error: null};
};

export const validatePin = pin => {
  if (!pin) {
    return {valid: false, error: 'PIN is required'};
  }
  if (pin.length !== PIN_LENGTH) {
    return {valid: false, error: `PIN must be ${PIN_LENGTH} digits`};
  }
  if (!/^\d+$/.test(pin)) {
    return {valid: false, error: 'PIN must contain only numbers'};
  }
  // Check for sequential digits (1234, 4321)
  const isSequential =
    pin === '1234' || pin === '4321' || pin === '0123' || pin === '3210';
  if (isSequential) {
    return {valid: false, error: 'PIN cannot be sequential numbers'};
  }
  // Check for all same digits (1111, 0000)
  if (/^(\d)\1+$/.test(pin)) {
    return {valid: false, error: 'PIN cannot be all the same digit'};
  }
  return {valid: true, error: null};
};

export const validateDisplayName = name => {
  if (!name || !name.trim()) {
    return {valid: false, error: 'Display name is required'};
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return {valid: false, error: 'Name must be at least 2 characters'};
  }
  if (trimmed.length > 30) {
    return {valid: false, error: 'Name must be 30 characters or less'};
  }
  return {valid: true, error: null};
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return {valid: false, error: 'Please confirm your password'};
  }
  if (password !== confirmPassword) {
    return {valid: false, error: 'Passwords do not match'};
  }
  return {valid: true, error: null};
};
