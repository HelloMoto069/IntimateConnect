import {useCallback} from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const useHaptic = () => {
  const trigger = useCallback((type = 'impactLight') => {
    ReactNativeHapticFeedback.trigger(type, options);
  }, []);

  const light = useCallback(() => trigger('impactLight'), [trigger]);
  const medium = useCallback(() => trigger('impactMedium'), [trigger]);
  const heavy = useCallback(() => trigger('impactHeavy'), [trigger]);
  const success = useCallback(
    () => trigger('notificationSuccess'),
    [trigger],
  );
  const error = useCallback(() => trigger('notificationError'), [trigger]);
  const selection = useCallback(() => trigger('selection'), [trigger]);

  return {trigger, light, medium, heavy, success, error, selection};
};
