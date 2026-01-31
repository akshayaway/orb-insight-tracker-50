import { hapticImpact, hapticNotification, hapticSelection, isNative } from './capacitor';

// Convenience wrappers for common haptic patterns

/**
 * Light tap feedback - for button presses, selections
 */
export async function tapFeedback() {
  await hapticImpact('light');
}

/**
 * Medium impact - for important actions like saving
 */
export async function actionFeedback() {
  await hapticImpact('medium');
}

/**
 * Heavy impact - for destructive or significant actions
 */
export async function heavyFeedback() {
  await hapticImpact('heavy');
}

/**
 * Success feedback - trade saved, action completed
 */
export async function successFeedback() {
  await hapticNotification('success');
}

/**
 * Warning feedback - validation errors, cautions
 */
export async function warningFeedback() {
  await hapticNotification('warning');
}

/**
 * Error feedback - failed operations
 */
export async function errorFeedback() {
  await hapticNotification('error');
}

/**
 * Selection feedback - scrolling through lists, picking items
 */
export async function selectionFeedback() {
  await hapticSelection();
}

/**
 * Check if haptics are available
 */
export function hapticsAvailable() {
  return isNative;
}
