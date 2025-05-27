'use client';

import { useEffect } from 'react';

export default function WidgetDemo() {
  // Initialize widget when the component mounts
  useEffect(() => {
    // Initialize widget configuration
    window.domIQChat = window.domIQChat || {
      q: [],
      config: {
        propertyId: 'demo',
        theme: 'light',
        position: 'bottom-right'
      }
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = '/widget.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="font-sans leading-relaxed max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">DomIQ Chat Widget Demo</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Installation</h2>
        <p className="mb-4">Add the following script tag to your website:</p>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto mb-4">
          <code>{`<script>
  // DomIQ Chat Widget Configuration
  window.domIQChat = window.domIQChat || {
    q: [],
    config: {
      propertyId: 'YOUR_PROPERTY_ID', // Required: Your unique property identifier
      theme: 'light',                 // Optional: 'light' or 'dark'
      position: 'bottom-right'        // Optional: Widget position
    }
  };
</script>
<script async src="https://chat.domiq.ai/widget.min.js"></script>`}</code>
        </pre>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Configuration Options</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>propertyId</strong>: Your unique property identifier (required)</li>
          <li><strong>theme</strong>: Widget theme - 'light' or 'dark' (optional)</li>
          <li><strong>position</strong>: Widget position - 'bottom-right', 'bottom-left' (optional)</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Methods</h2>
        <p className="mb-4">You can programmatically control the widget using the following methods:</p>
        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
          <code>{`// Initialize with new config
domIQChat.init({
  propertyId: 'NEW_PROPERTY_ID',
  theme: 'dark'
});`}</code>
        </pre>
      </section>
    </div>
  );
} 