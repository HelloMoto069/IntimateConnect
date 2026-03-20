import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';
import {useTheme} from '@context/ThemeContext';
import {BORDER_RADIUS} from '@utils/constants';

const BottomSheet = ({visible, onClose, children, title}) => {
  const {theme} = useTheme();

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      propagateSwipe
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <View
        style={[styles.container, {backgroundColor: theme.colors.surface}]}>
        <View style={styles.handleContainer}>
          <View
            style={[
              styles.handle,
              {backgroundColor: theme.colors.textSecondary},
            ]}
          />
        </View>
        {title && (
          <Text style={[styles.title, {color: theme.colors.text}]}>
            {title}
          </Text>
        )}
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingBottom: 34,
    maxHeight: '80%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});

export default BottomSheet;
