import { initializeWidget } from './index';

// Self-executing function to initialize the widget
(function () {
  if (typeof window !== 'undefined') {
    initializeWidget();
  }
})();
