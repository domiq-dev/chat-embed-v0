'use client';

import { useState, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableFooter } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { X, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { dummyProspects, DummyProspect, dummyTours } from '@/lib/dummy-data'; // Import dummy data

// Extend DummyProspect for this page to include toursCount
interface Contact extends DummyProspect {
  toursCount: number;
}

// Calculate toursCount for each prospect
const initialContacts: Contact[] = dummyProspects.map(prospect => ({
  ...prospect,
  toursCount: dummyTours.filter(tour => tour.prospectId === prospect.id && (tour.status === 'completed' || tour.status === 'scheduled')).length,
}));

const statusColors = {
  prospect: 'bg-gray-100 text-gray-700',
  toured: 'bg-purple-100 text-purple-700',
  leased: 'bg-green-100 text-green-700',
};

// Omit id and toursCount for the AddContactModal form
function AddContactModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (contact: Omit<Contact, 'id' | 'toursCount'>) => void }) {
  const [form, setForm] = useState<Omit<Contact, 'id' | 'toursCount'>>({
    name: '',
    email: '',
    phone: '',
    status: 'prospect',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onAdd(form);
            setForm({ name: '', email: '', phone: '', status: 'prospect' });
            onClose();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as Contact['status'] }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="prospect">Prospect</option>
              <option value="toured">Toured</option>
              <option value="leased">Leased</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditContactModal({ 
  isOpen, 
  onClose, 
  onSave, 
  contact 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (contact: Contact) => void; 
  contact: Contact | null;
}) {
  const [form, setForm] = useState<Omit<Contact, 'id' | 'toursCount'>>({
    name: '',
    email: '',
    phone: '',
    status: 'prospect',
  });

  // Update form when contact prop changes
  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        status: contact.status,
      });
    }
  }, [contact]);

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Contact</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave({
              ...contact,
              ...form,
            });
            onClose();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as Contact['status'] }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="prospect">Prospect</option>
              <option value="toured">Toured</option>
              <option value="leased">Leased</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete confirmation modal
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  contactName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  contactName: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-semibold">Delete Contact</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{contactName}</strong>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'toursCount'>) => {
    setContacts(prev => [
      ...prev,
      { ...contactData, id: Math.random().toString(36).substr(2, 9), toursCount: 0 },
    ]);
  };

  const handleEditContact = (updatedContact: Contact) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
  };

  const handleDeleteConfirm = () => {
    if (deletingContact) {
      setContacts(prev => prev.filter(c => c.id !== deletingContact.id));
      setDeletingContact(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Prospective Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold text-gray-700">Name</TableCell>
                  <TableCell className="font-semibold text-gray-700">Email</TableCell>
                  <TableCell className="font-semibold text-gray-700">Phone</TableCell>
                  <TableCell className="font-semibold text-gray-700">Tours</TableCell>
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell className="font-semibold text-gray-700 text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-purple-50 transition-colors">
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">{contact.email}</a>
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${contact.phone.replace(/[^\d]/g, '')}`} className="text-gray-700 hover:underline">{contact.phone}</a>
                    </TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">{contact.toursCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[contact.status]}`}>{contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingContact(contact)}
                          className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingContact(contact)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">Total Prospects</TableCell>
                  <TableCell colSpan={3} className="font-semibold">{contacts.length}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AddContactModal 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onAdd={handleAddContact} 
      />
      
      <EditContactModal
        isOpen={!!editingContact}
        onClose={() => setEditingContact(null)}
        onSave={handleEditContact}
        contact={editingContact}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingContact}
        onClose={() => setDeletingContact(null)}
        onConfirm={handleDeleteConfirm}
        contactName={deletingContact?.name || ''}
      />
    </div>
  );
} 