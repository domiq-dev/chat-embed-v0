import { DomIQChatConfig, DomIQChatMessage } from './types';

interface DomIQChatAPI {
  q: Array<[string, ...any[]]>;
  config: DomIQChatConfig;
  init(config: Partial<DomIQChatConfig>): void;
}

declare global {
  interface Window {
    domIQChat: DomIQChatAPI;
  }
}

// Widget loader implementation
export function initializeWidget() {
  // Configuration object
  window.domIQChat = window.domIQChat || {
    q: [], // Command queue
    config: {
      propertyId: null,
      theme: 'light',
      position: 'bottom-right'
    }
  };

  // Create iframe container
  const container = document.createElement('div');
  container.id = 'domiq-chat-widget-container';
  Object.assign(container.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: '999999',
    height: '0px',
    width: '0px',
    maxWidth: '100%',
    opacity: '1'
  });

  // Create and setup iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'domiq-chat-widget-iframe';
  iframe.title = 'DomIQ Chat Widget';
  iframe.role = 'dialog';
  iframe.ariaLabel = 'Chat with our AI Leasing Agent';
  Object.assign(iframe.style, {
    border: 'none',
    position: 'fixed',
    bottom: '0px',
    right: '0px',
    width: '100%',
    height: '100%',
    maxHeight: '100vh',
    background: 'transparent'
  });

  // Add to page
  container.appendChild(iframe);
  document.body.appendChild(container);

  // Handle messages from iframe
  window.addEventListener('message', function(event) {
    const data = event.data as DomIQChatMessage;
    if (data.type === 'domiq-widget-height') {
      container.style.height = `${data.height}px`;
    }
  });

  // Initialize widget
  function init(config?: Partial<DomIQChatConfig>) {
    if (config) {
      window.domIQChat.config = { ...window.domIQChat.config, ...config };
    }
    
    // Use relative URL for local development
    const isDev = process.env.NODE_ENV === 'development';
    const baseUrl = isDev ? '' : 'https://chat.domiq.ai';
    const widgetUrl = new URL(`${baseUrl}/embed/agent`, window.location.origin);
    
    Object.entries(window.domIQChat.config).forEach(([key, value]) => {
      if (value !== null) {
        widgetUrl.searchParams.append(key, value);
      }
    });
    
    iframe.src = widgetUrl.toString();
  }

  // Process any queued commands
  const processQueue = () => {
    while (window.domIQChat.q.length > 0) {
      const [method, ...args] = window.domIQChat.q.shift()!;
      if (method === 'init') {
        init(...args);
      }
    }
  };

  // API methods
  window.domIQChat.init = function(config) {
    window.domIQChat.q.push(['init', config]);
    processQueue();
  };

  // Process any existing queue items
  processQueue();
} 