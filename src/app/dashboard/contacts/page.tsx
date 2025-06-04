'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
  SortDirection,
} from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { X, Plus, Trash2, Edit2, AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { dummyProspects, DummyProspect, dummyTours } from '@/lib/dummy-data'; // Import dummy data

// Extend DummyProspect for this page to include toursCount
interface Contact extends DummyProspect {
  toursCount: number;
}

// Calculate toursCount for each prospect
const initialContacts: Contact[] = dummyProspects.map((prospect) => ({
  ...prospect,
  toursCount: dummyTours.filter(
    (tour) =>
      tour.prospectId === prospect.id &&
      (tour.status === 'completed' || tour.status === 'scheduled'),
  ).length,
}));

const statusColors = {
  prospect: 'bg-gray-100 text-gray-700',
  toured: 'bg-purple-100 text-purple-700',
  leased: 'bg-green-100 text-green-700',
};

// Omit id and toursCount for the AddContactModal form
function AddContactModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (contact: Omit<Contact, 'id' | 'toursCount'>) => void;
}) {
  const [form, setForm] = useState<Omit<Contact, 'id' | 'toursCount'>>({
    name: '',
    email: '',
    phone: '',
    status: 'prospect',
    moveInDate: '',
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
          onSubmit={(e) => {
            e.preventDefault();
            onAdd(form);
            setForm({
              name: '',
              email: '',
              phone: '',
              status: 'prospect',
              moveInDate: '',
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
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
            <input
              type="date"
              value={form.moveInDate}
              onChange={(e) => setForm((f) => ({ ...f, moveInDate: e.target.value || 'N/A' }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as Contact['status'],
                }))
              }
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
  contact,
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
    moveInDate: '',
  });

  // Update form when contact prop changes
  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        status: contact.status,
        moveInDate: contact.moveInDate || '',
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
          onSubmit={(e) => {
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
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Move-in Date</label>
            <input
              type="date"
              value={form.moveInDate}
              onChange={(e) => setForm((f) => ({ ...f, moveInDate: e.target.value || 'N/A' }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as Contact['status'],
                }))
              }
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
  contactName,
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
          Are you sure you want to delete <strong>{contactName}</strong>? This action cannot be
          undone.
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

// Helper function to convert date to sortable value
const getDateSortValue = (date: string | undefined): number => {
  if (!date) return Number.MAX_SAFE_INTEGER; // Push N/A to bottom
  return new Date(date).getTime();
};

const SortIcon = ({ direction }: { direction: false | SortDirection }) => {
  if (!direction) {
    return (
      <div className="relative ml-1 h-4">
        <ChevronUp className="w-4 h-4 absolute -top-2 text-gray-400" />
        <ChevronDown className="w-4 h-4 absolute -bottom-2 text-gray-400" />
      </div>
    );
  }
  return direction === 'asc' ? (
    <ChevronUp className="w-4 h-4 ml-1 text-purple-600" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1 text-purple-600" />
  );
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const columnHelper = createColumnHelper<Contact>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="flex items-center gap-1">
            Name
            <SortIcon direction={column.getIsSorted()} />
          </button>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
      }),
      columnHelper.accessor('phone', {
        header: 'Phone',
      }),
      columnHelper.accessor('moveInDate', {
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="flex items-center gap-1">
            Move-in Date
            <SortIcon direction={column.getIsSorted()} />
          </button>
        ),
        sortingFn: (a, b, columnId) => {
          const rawA = a.getValue(columnId) as string;
          const rawB = b.getValue(columnId) as string;

          const dateA = rawA === 'N/A' || !rawA ? null : new Date(rawA);
          const dateB = rawB === 'N/A' || !rawB ? null : new Date(rawB);

          if (!dateA && !dateB) return 0;
          if (!dateA) return 1; // N/A goes to bottom in ascending
          if (!dateB) return -1;

          return dateA.getTime() - dateB.getTime();
        },
        cell: ({ row }) => row.original.moveInDate || 'N/A',
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.original.status]}`}
          >
            {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </span>
        ),
      }),
      columnHelper.accessor('toursCount', {
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="flex items-center gap-1">
            Tours
            <SortIcon direction={column.getIsSorted()} />
          </button>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedContact(row.original);
                setShowEditModal(true);
              }}
              className="p-1 text-gray-400 hover:text-purple-600"
              title="Edit contact"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedContact(row.original);
                setShowDeleteModal(true);
              }}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Delete contact"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: contacts,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleAddContact = (contactData: Omit<Contact, 'id' | 'toursCount'>) => {
    const newContact: Contact = {
      ...contactData,
      id: `prospect${contacts.length + 1}`,
      toursCount: 0,
    };
    setContacts([...contacts, newContact]);
  };

  const handleEditContact = (updatedContact: Contact) => {
    setContacts(contacts.map((c) => (c.id === updatedContact.id ? updatedContact : c)));
  };

  const handleDeleteConfirm = () => {
    if (selectedContact) {
      setContacts(contacts.filter((c) => c.id !== selectedContact.id));
      setShowDeleteModal(false);
      setSelectedContact(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contacts</CardTitle>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-2 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-200 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={7} className="px-4 py-2 text-right">
                  Total Contacts: {contacts.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddContact}
      />

      <EditContactModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditContact}
        contact={selectedContact}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedContact(null);
        }}
        onConfirm={handleDeleteConfirm}
        contactName={selectedContact?.name || ''}
      />
    </Card>
  );
}
