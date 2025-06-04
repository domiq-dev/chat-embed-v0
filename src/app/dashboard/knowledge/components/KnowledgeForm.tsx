'use client';

import { useState, useRef } from 'react';
import { X, Plus, Download, Upload, ChevronDown } from 'lucide-react';

interface Community {
  id: string;
  name: string;
}

interface Domain {
  id: string;
  name: string;
}

interface KnowledgeEntry {
  topic: string;
  information: string;
}

// Mock data for available communities and domains
const availableCommunities: Community[] = [
  { id: '1', name: 'Alexander Pointe Apartments' },
  { id: '2', name: 'Riverside Gardens' },
  { id: '3', name: 'Oak Valley Residences' },
  { id: '4', name: 'Highland Park Apartments' },
];

const availableDomains: Domain[] = [
  { id: '1', name: 'Leasing' },
  { id: '2', name: 'Resident' },
  { id: '3', name: 'Amenities' },
  { id: '4', name: 'Policies' },
];

export default function KnowledgeForm() {
  const [selectedCommunities, setSelectedCommunities] = useState<Community[]>([
    { id: '1', name: 'Alexander Pointe Apartments' },
  ]);

  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([
    { id: '1', name: 'Leasing' },
    { id: '2', name: 'Resident' },
  ]);

  const [entries, setEntries] = useState<KnowledgeEntry[]>([
    {
      topic: 'Pet Policy',
      information: 'The pet fee is $200 per pet and up to 2 pets per unit.',
    },
    {
      topic: 'Community',
      information:
        'Our community has an Applebees, a Cheesecake Factory, and a diner down the street.',
    },
  ]);

  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNewEntry = () => {
    setEntries([...entries, { topic: '', information: '' }]);
  };

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: keyof KnowledgeEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const removeCommunity = (communityId: string) => {
    setSelectedCommunities(selectedCommunities.filter((c) => c.id !== communityId));
  };

  const removeDomain = (domainId: string) => {
    setSelectedDomains(selectedDomains.filter((d) => d.id !== domainId));
  };

  const addCommunity = (community: Community) => {
    if (!selectedCommunities.find((c) => c.id === community.id)) {
      setSelectedCommunities([...selectedCommunities, community]);
    }
    setShowCommunityDropdown(false);
  };

  const addDomain = (domain: Domain) => {
    if (!selectedDomains.find((d) => d.id === domain.id)) {
      setSelectedDomains([...selectedDomains, domain]);
    }
    setShowDomainDropdown(false);
  };

  const downloadTemplate = () => {
    const headers = ['topic', 'information'];

    // Helper function to escape CSV fields
    const escapeCSV = (field: string) => {
      // If field contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
      if (field.includes('"') || field.includes(',') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    const csvContent = [
      headers.join(','),
      ...entries.map((entry) => `${escapeCSV(entry.topic)},${escapeCSV(entry.information)}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge_base_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      // Parse CSV properly handling quoted fields
      const parseCSVLine = (line: string) => {
        const entries = [];
        let field = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Handle escaped quotes
              field += '"';
              i++;
            } else {
              // Toggle quote mode
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // End of field
            entries.push(field);
            field = '';
          } else {
            field += char;
          }
        }

        // Add the last field
        entries.push(field);
        return entries;
      };

      const lines = text.split('\n').filter((line) => line.trim());
      const headers = parseCSVLine(lines[0]);

      const newEntries: KnowledgeEntry[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCSVLine(lines[i]);
        newEntries.push({
          topic: values[0]?.trim() || '',
          information: values[1]?.trim() || '',
        });
      }

      setEntries(newEntries);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Knowledge Base Entry</h2>

        {/* Apply To Section */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700">Apply To</label>
          <div className="space-y-4">
            {/* Communities */}
            <div className="relative">
              <label className="block text-sm text-gray-500 mb-2">Communities *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedCommunities.map((community) => (
                  <div
                    key={community.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md"
                  >
                    <span>{community.name}</span>
                    <X
                      className="w-4 h-4 text-gray-500 cursor-pointer"
                      onClick={() => removeCommunity(community.id)}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Add Community
                <ChevronDown className="w-4 h-4" />
              </button>
              {showCommunityDropdown && (
                <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                  {availableCommunities
                    .filter((c) => !selectedCommunities.find((sc) => sc.id === c.id))
                    .map((community) => (
                      <button
                        key={community.id}
                        onClick={() => addCommunity(community)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {community.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Domains */}
            <div className="relative">
              <label className="block text-sm text-gray-500 mb-2">Domains *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedDomains.map((domain) => (
                  <div
                    key={domain.id}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md"
                  >
                    <span>{domain.name}</span>
                    <X
                      className="w-4 h-4 text-gray-500 cursor-pointer"
                      onClick={() => removeDomain(domain.id)}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowDomainDropdown(!showDomainDropdown)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Add Domain
                <ChevronDown className="w-4 h-4" />
              </button>
              {showDomainDropdown && (
                <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                  {availableDomains
                    .filter((d) => !selectedDomains.find((sd) => sd.id === d.id))
                    .map((domain) => (
                      <button
                        key={domain.id}
                        onClick={() => addDomain(domain)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {domain.name}
                      </button>
                    ))}
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500">
                Note: affordable knowledge is managed on the Affordable Settings page
                <br />
                Note: maintenance knowledge is managed on the Maintenance Settings page
              </div>
            </div>
          </div>
        </div>

        {/* Knowledge Entries */}
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
              <button
                onClick={() => removeEntry(index)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Topic *</label>
                  <input
                    type="text"
                    value={entry.topic}
                    onChange={(e) => updateEntry(index, 'topic', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Information *</label>
                  <textarea
                    value={entry.information}
                    onChange={(e) => updateEntry(index, 'information', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addNewEntry}
            className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <Upload className="w-4 h-4" />
            Bulk Upload CSV
          </button>
        </div>
      </div>
    </div>
  );
}
