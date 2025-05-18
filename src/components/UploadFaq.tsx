// src/components/UploadFaq.tsx

'use client';
import { useState } from 'react';

export default function UploadFaq() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload-faq', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert('Failed to upload file.');
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
    setUploading(false);
  }

  return (
    <div className="p-4 border rounded shadow-md max-w-md mx-auto my-4">
      <h2 className="text-lg font-bold mb-2">Upload Leasing FAQ</h2>
      <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} />
      {uploading && <p>Uploading...</p>}
      {success && <p className="text-green-600">Upload successful! The bot has updated.</p>}
    </div>
  );
}
