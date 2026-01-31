import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Keyboard } from '@capacitor/keyboard';
import { App } from '@capacitor/app';

// Platform detection utilities
export const isNative = Capacitor.isNativePlatform();
export const isAndroid = Capacitor.getPlatform() === 'android';
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isWeb = Capacitor.getPlatform() === 'web';

// Initialize Capacitor plugins for native platforms
export async function initializeCapacitor() {
  if (!isNative) return;

  try {
    // Configure status bar for dark theme
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#1f1f1f' });

    // Hide splash screen after app is ready
    await SplashScreen.hide();

    // Set up keyboard handling for iOS
    if (isIOS) {
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-open');
      });
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-open');
      });
    }

    // Handle back button on Android
    if (isAndroid) {
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    }

    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
}

// Haptic feedback utilities
export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!isNative) return;
  
  try {
    const impactStyle = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    }[style];
    
    await Haptics.impact({ style: impactStyle });
  } catch (error) {
    console.error('Haptic impact error:', error);
  }
}

export async function hapticNotification(type: 'success' | 'warning' | 'error' = 'success') {
  if (!isNative) return;
  
  try {
    const notificationType = {
      success: NotificationType.Success,
      warning: NotificationType.Warning,
      error: NotificationType.Error,
    }[type];
    
    await Haptics.notification({ type: notificationType });
  } catch (error) {
    console.error('Haptic notification error:', error);
  }
}

export async function hapticSelection() {
  if (!isNative) return;
  
  try {
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch (error) {
    console.error('Haptic selection error:', error);
  }
}

// Status bar utilities
export async function setStatusBarColor(color: string) {
  if (!isNative) return;
  
  try {
    await StatusBar.setBackgroundColor({ color });
  } catch (error) {
    console.error('Status bar color error:', error);
  }
}

export async function hideStatusBar() {
  if (!isNative) return;
  
  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('Hide status bar error:', error);
  }
}

export async function showStatusBar() {
  if (!isNative) return;
  
  try {
    await StatusBar.show();
  } catch (error) {
    console.error('Show status bar error:', error);
  }
}

// Splash screen utilities
export async function showSplashScreen() {
  if (!isNative) return;
  
  try {
    await SplashScreen.show({
      autoHide: false,
      fadeInDuration: 300,
      fadeOutDuration: 300,
    });
  } catch (error) {
    console.error('Show splash screen error:', error);
  }
}

export async function hideSplashScreen() {
  if (!isNative) return;
  
  try {
    await SplashScreen.hide({
      fadeOutDuration: 300,
    });
  } catch (error) {
    console.error('Hide splash screen error:', error);
  }
}

// Keyboard utilities
export async function hideKeyboard() {
  if (!isNative) return;
  
  try {
    await Keyboard.hide();
  } catch (error) {
    console.error('Hide keyboard error:', error);
  }
}
