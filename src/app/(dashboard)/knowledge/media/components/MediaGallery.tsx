'use client';

import { useState } from 'react';
import { Search, Filter, Download, Trash2, X } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  tags?: string[];
}

interface MediaGalleryProps {
  items: MediaItem[];
  onDelete: (id: string) => void;
}

export default function MediaGallery({ items, onDelete }: MediaGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="image/png">PNG</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/gif">GIF</option>
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square border rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedItem(item)}
          >
            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium truncate">{item.name}</p>
                <p className="text-white/70 text-xs">{formatFileSize(item.size)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">{selectedItem.name}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 flex gap-8">
              <div className="flex-1">
                <img
                  src={selectedItem.url}
                  alt={selectedItem.name}
                  className="w-full h-auto rounded-lg"
                />
              </div>
              <div className="w-72 space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Details</h4>
                  <dl className="mt-2 space-y-2">
                    <div>
                      <dt className="text-xs text-gray-500">Type</dt>
                      <dd className="text-sm">{selectedItem.type}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Size</dt>
                      <dd className="text-sm">{formatFileSize(selectedItem.size)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500">Uploaded</dt>
                      <dd className="text-sm">{selectedItem.uploadedAt.toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(selectedItem.url, '_blank')}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      onDelete(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
