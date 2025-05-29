'use client';

import { useState, useEffect } from 'react';
import MediaUpload from './components/MediaUpload';
import MediaGallery from './components/MediaGallery';
import { Plus, AlertTriangle } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string; // Now a proper URL path instead of base64
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  tags?: string[];
}

const LOCAL_STORAGE_KEY = 'mediaLibraryItems';

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
  } catch (error) {
    console.error('Error deserializing media items:', error);
    return [];
  }
}

export default function MediaPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from API and localStorage on mount
  useEffect(() => {
    const loadMediaItems = async () => {
      try {
        // First try to load from API
        const response = await fetch('/api/media-metadata');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.metadata) {
            const items = result.metadata.map((item: any) => ({
              ...item,
              uploadedAt: new Date(item.uploadedAt),
            }));
            console.log('Loaded from API:', items.length, 'items');
            setMediaItems(items);
            
            // Also save to localStorage as backup
            localStorage.setItem(LOCAL_STORAGE_KEY, serializeMediaItems(items));
            setIsLoaded(true);
            return;
          }
        }
        
        // Fallback to localStorage
        console.log('API failed, trying localStorage');
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const items = deserializeMediaItems(stored);
          console.log('Loaded from localStorage:', items.length, 'items');
          setMediaItems(items);
          
          // Sync to API
          await syncToAPI(items);
        }
      } catch (error) {
        console.error('Error loading media items:', error);
        setError('Failed to load media library');
      } finally {
        setIsLoaded(true);
      }
    };

    loadMediaItems();
  }, []);

  // Sync data to API
  const syncToAPI = async (items: MediaItem[]) => {
    try {
      const metadata = items.map(item => ({
        ...item,
        uploadedAt: item.uploadedAt.toISOString(),
      }));
      
      await fetch('/api/media-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata }),
      });
      console.log('Synced to API:', items.length, 'items');
    } catch (error) {
      console.error('Failed to sync to API:', error);
    }
  };

  // Save to both localStorage and API whenever mediaItems changes (but only after initial load)
  useEffect(() => {
    if (isLoaded && mediaItems.length >= 0) {
      try {
        // Save to localStorage
        const serialized = serializeMediaItems(mediaItems);
        localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
        console.log('Saved to localStorage:', mediaItems.length, 'items');
        
        // Save to API
        syncToAPI(mediaItems);
      } catch (error) {
        console.error('Error saving media items:', error);
        setError('Failed to save media metadata');
      }
    }
  }, [mediaItems, isLoaded]);

  const handleUpload = async (newItems: MediaItem[]) => {
    setError(null);
    
    // Add the new items to our collection
    setMediaItems(prev => [...prev, ...newItems]);
    setShowUpload(false);
  };

  const handleDelete = async (id: string) => {
    // Find the item to delete
    const itemToDelete = mediaItems.find(item => item.id === id);
    if (!itemToDelete) return;

    try {
      // Call API to delete the physical file
      const deleteFileResponse = await fetch('/api/delete-media', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: itemToDelete.url }),
      });

      if (!deleteFileResponse.ok) {
        throw new Error('Failed to delete file from server');
      }

      // Remove metadata from API
      await fetch('/api/media-metadata', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      // Remove from state (this will trigger the useEffect to save to localStorage)
      setMediaItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      setError('Failed to delete file. It may still exist on the server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          disabled={!isLoaded}
        >
          <Plus className="h-5 w-5" />
          Upload Media
        </button>
      </div>

      {!isLoaded && (
        <div className="text-center text-gray-500 py-8">
          Loading media library...
        </div>
      )}

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

      {/* Stats Cards - only show when loaded */}
      {isLoaded && (
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
      )}

      {/* Gallery - only show when loaded */}
      {isLoaded && <MediaGallery items={mediaItems} onDelete={handleDelete} />}
    </div>
  );
} 