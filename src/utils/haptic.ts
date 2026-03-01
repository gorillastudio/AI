import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const triggerHaptic = async () => {
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    console.warn('Haptic feedback not supported or failed', error);
  }
};
