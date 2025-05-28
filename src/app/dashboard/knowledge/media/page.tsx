'use client';

import { useState } from 'react';
import MediaUpload from './components/MediaUpload';
import MediaGallery from './components/MediaGallery';
import { Plus } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  tags?: string[];
}

export default function MediaPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const handleUpload = async (files: File[]) => {
    // In a real application, you would upload these files to your backend
    // For now, we'll create local URLs
    const newItems: MediaItem[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    }));

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