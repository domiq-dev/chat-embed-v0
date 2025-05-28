'use client';

import { useState, useEffect } from 'react';
import MediaUpload from './components/MediaUpload';
import MediaGallery from './components/MediaGallery';
import { Plus, AlertTriangle } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string; // base64 data URL
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  tags?: string[];
}

const LOCAL_STORAGE_KEY = 'mediaLibraryItems';
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

function serializeMediaItems(items: MediaItem[]): string {
  return JSON.stringify(items.map(item => ({
    ...item,
    uploadedAt: item.uploadedAt.toISOString(),
  })));
}

function deserializeMediaItems(data: string): MediaItem[] {
  try {
    const arr = JSON.parse(data);
    return arr.map((item: any) => ({
      ...item,
      uploadedAt: new Date(item.uploadedAt),
    }));
  } catch {
    return [];
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MediaPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setMediaItems(deserializeMediaItems(stored));
    }
  }, []);

  // Save to localStorage whenever mediaItems changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, serializeMediaItems(mediaItems));
  }, [mediaItems]);

  const handleUpload = async (files: File[]) => {
    setError(null);
    const tooLarge = files.find(file => file.size > MAX_FILE_SIZE);
    if (tooLarge) {
      setError(`File "${tooLarge.name}" is too large. Max size is 1MB.`);
      return;
    }
    // Convert files to base64 data URLs
    const newItems: MediaItem[] = await Promise.all(files.map(async file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: await fileToBase64(file),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    })));
    setMediaItems(prev => [...prev, ...newItems]);
    setShowUpload(false);
  };

  const handleDelete = (id: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-5 w-5" />
          Upload Media
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-300">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-yellow-700 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">Upload Media</h3>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <MediaUpload onUpload={handleUpload} />
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Files</p>
          <p className="text-2xl font-semibold">{mediaItems.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total Size</p>
          <p className="text-2xl font-semibold">
            {(mediaItems.reduce((acc, item) => acc + item.size, 0) / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Image Types</p>
          <p className="text-2xl font-semibold">
            {new Set(mediaItems.map(item => item.type.split('/')[1].toUpperCase())).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Last Upload</p>
          <p className="text-2xl font-semibold">
            {mediaItems.length > 0
              ? new Date(Math.max(...mediaItems.map(item => item.uploadedAt.getTime()))).toLocaleDateString()
              : '-'}
          </p>
        </div>
      </div>

      {/* Gallery */}
      <MediaGallery items={mediaItems} onDelete={handleDelete} />
    </div>
  );
} 