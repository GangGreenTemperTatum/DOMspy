import { logger } from '../lib/logger';
import Popup from './Popup.svelte';

function initPopup() {
  try {
    const target = document.getElementById('app');
    if (!target) {
      throw new Error('Could not find app element');
    }

    logger.log('Initializing popup');

    const app = new Popup({
      target
    });

    return app;
  } catch (error) {
    logger.error('Failed to initialize popup', error as Error);
    return null;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const popup = initPopup();
  if (popup) {
    (window as any).popup = popup;
  }
});

export default initPopup;