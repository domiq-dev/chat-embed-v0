// Simple widget for apartment websites
export function initializeWidget() {
  // Don't initialize twice
  if (document.getElementById('domiq-chat-widget')) {
    return;
  }

  // Get config from window.domIQChat
  const config = (window as any).domIQChat?.config || { propertyId: 'demo' };

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'domiq-chat-widget';
  iframe.src = `${window.location.origin}/embed/agent?propertyId=${config.propertyId}`;
  iframe.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 450px;
    height: 750px;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 999999;
    background: white;
    overflow: hidden;
  `;

  // Add to page
  document.body.appendChild(iframe);
}
