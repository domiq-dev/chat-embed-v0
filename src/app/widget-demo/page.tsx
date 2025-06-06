'use client';

import { useEffect } from 'react';

export default function WidgetDemo() {
  useEffect(() => {
    // Set up widget config
    (window as any).domIQChat = {
      config: {
        propertyId: 'demo',
      },
    };

    // Load widget script
    const script = document.createElement('script');
    script.src = '/widget.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Widget Test</h1>
      <p>Simple test page. Widget should appear in bottom-right corner.</p>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-semibold mb-2">
          For apartment websites, add these script tags:
        </h2>
        <pre className="bg-black text-green-400 p-4 rounded text-sm">
          {`<script>
  window.domIQChat = {
    config: {
      propertyId: 'YOUR_PROPERTY_ID'
    }
  };
</script>
<script async src="https://chat.domiq.ai/widget.min.js"></script>`}
        </pre>
      </div>
    </div>
  );
}
