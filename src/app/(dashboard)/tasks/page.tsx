'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { X, Plus, CheckCircle, Trash2, User, Filter, Edit2, Check, X as XIcon } from 'lucide-react';
import { useLeadContext } from '@/lib/lead-context';
import { dummyTasks, DummyTask } from '@/lib/dummy-data';

interface Task extends DummyTask {}

const initialTasks: Task[] = dummyTasks;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  answered: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

// Inline editable answer component
function EditableAnswer({
  task,
  onSave,
}: {
  task: Task;
  onSave: (taskId: string, answer: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.answer);

  const handleSave = () => {
    onSave(task.id, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(task.answer);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] text-sm"
          placeholder="Enter answer..."
          autoFocus
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Check className="w-3 h-3" />
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <XIcon className="w-3 h-3" />
            Cancel
          </button>
        </div>
        <div className="text-xs text-gray-500">Tip: Press Ctrl+Enter to save, Esc to cancel</div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="max-w-xs whitespace-pre-line text-gray-700 cursor-pointer hover:bg-gray-50 rounded p-2 -m-2 transition-colors group"
      title="Click to edit answer"
    >
      {task.answer ? (
        <div className="relative">
          {task.answer}
          <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 absolute top-0 right-0 transition-opacity" />
        </div>
      ) : (
        <span className="italic text-gray-400 flex items-center gap-1">
          No answer yet - Click to add
          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      )}
    </div>
  );
}

function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: string, leadId?: string) => void;
}) {
  const [question, setQuestion] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const { leads } = useLeadContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add User Question</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (question.trim()) {
              onAdd(question.trim(), selectedLeadId || undefined);
              setQuestion('');
              setSelectedLeadId('');
              onClose();
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Associated Lead (Optional)
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a lead (optional)</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.currentStage.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px]"
              required
            />
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
              Add Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterByLead, setFilterByLead] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { leads, setSelectedLead } = useLeadContext();

  const getLeadName = (leadId?: string) => {
    if (!leadId) return null;
    const lead = leads.find((l) => l.id === leadId);
    return lead?.name || 'Unknown Lead';
  };

  const filteredTasks = tasks.filter((task) => {
    const leadMatch = !filterByLead || task.leadId === filterByLead;
    const statusMatch = !statusFilter || task.status === statusFilter;
    return leadMatch && statusMatch;
  });

  const handleAddTask = (question: string, leadId?: string) => {
    setTasks((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        question,
        answer: '',
        status: 'pending',
        createdAt: new Date(),
        leadId,
        assignedTo: leadId ? leads.find((l) => l.id === leadId)?.assignedAgentId : undefined,
      },
    ]);
  };

  const handleSaveAnswer = (id: string, answer: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              answer,
              status: answer.trim() ? 'answered' : 'pending',
            }
          : task,
      ),
    );
  };

  const handleResolve = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: 'resolved' } : task)),
    );
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleLeadClick = (leadId?: string) => {
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        setSelectedLead(lead);
        // Navigate to activity page - in a real app you'd use router
        window.location.href = '/activity';
      }
    }
  };

  const tasksByStatus = {
    pending: filteredTasks.filter((t) => t.status === 'pending').length,
    answered: filteredTasks.filter((t) => t.status === 'answered').length,
    resolved: filteredTasks.filter((t) => t.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{filteredTasks.length}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{tasksByStatus.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{tasksByStatus.answered}</div>
            <div className="text-sm text-gray-500">Answered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{tasksByStatus.resolved}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterByLead}
              onChange={(e) => setFilterByLead(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Leads</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
              <option value="resolved">Resolved</option>
            </select>
            {(filterByLead || statusFilter) && (
              <button
                onClick={() => {
                  setFilterByLead('');
                  setStatusFilter('');
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Questions for AI Training</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableCell className="font-semibold text-gray-700">Question</TableCell>
                  <TableCell className="font-semibold text-gray-700">Answer</TableCell>
                  <TableCell className="font-semibold text-gray-700">Lead</TableCell>
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell className="font-semibold text-gray-700">Created</TableCell>
                  <TableCell className="font-semibold text-gray-700 text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-purple-50 transition-colors">
                    <TableCell className="max-w-xs whitespace-pre-line">{task.question}</TableCell>
                    <TableCell>
                      <EditableAnswer task={task} onSave={handleSaveAnswer} />
                    </TableCell>
                    <TableCell>
                      {task.leadId ? (
                        <button
                          onClick={() => handleLeadClick(task.leadId)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-800 underline"
                        >
                          <User className="w-3 h-3" />
                          {getLeadName(task.leadId)}
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">General</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[task.status]}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-center flex gap-2 justify-center">
                      {task.status === 'answered' && (
                        <button
                          onClick={() => handleResolve(task.id)}
                          className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50"
                          title="Mark as Resolved"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-semibold">
                    Total Questions
                  </TableCell>
                  <TableCell colSpan={3} className="font-semibold">
                    {filteredTasks.length}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AddTaskModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddTask} />
    </div>
  );
}
