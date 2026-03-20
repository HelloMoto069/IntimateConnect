import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import ToastMessage from 'react-native-toast-message';

export const toastConfig = {
  success: ({text1, text2}) => (
    <View style={[styles.toast, styles.success]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  ),
  error: ({text1, text2}) => (
    <View style={[styles.toast, styles.error]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  ),
  info: ({text1, text2}) => (
    <View style={[styles.toast, styles.info]}>
      <Text style={styles.title}>{text1}</Text>
      {text2 ? <Text style={styles.message}>{text2}</Text> : null}
    </View>
  ),
};

export const showToast = (type, title, message) => {
  ToastMessage.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 50,
  });
};

const styles = StyleSheet.create({
  toast: {
    width: '90%',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  success: {
    backgroundColor: '#1A1A2E',
    borderLeftColor: '#4CAF50',
  },
  error: {
    backgroundColor: '#1A1A2E',
    borderLeftColor: '#E94560',
  },
  info: {
    backgroundColor: '#1A1A2E',
    borderLeftColor: '#533483',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    color: '#A0A0B0',
    fontSize: 12,
    marginTop: 4,
  },
});
