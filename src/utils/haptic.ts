export const triggerHaptic = () => {
  try {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      // Use a more noticeable vibration duration for Android devices
      window.navigator.vibrate(100);
    }
  } catch (error) {
    console.warn('Haptic feedback not supported or failed', error);
  }
};
