'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableFooter } from '@/components/ui/table';
import { X, Plus, CheckCircle, Trash2 } from 'lucide-react';
import { dummyTasks, DummyTask } from '@/lib/dummy-data';

interface Task extends DummyTask {}

const initialTasks: Task[] = dummyTasks;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  answered: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

function AddTaskModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (question: string) => void }) {
  const [question, setQuestion] = useState('');
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
          onSubmit={e => {
            e.preventDefault();
            if (question.trim()) {
              onAdd(question.trim());
              setQuestion('');
              onClose();
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Question</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
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

function AnswerModal({ isOpen, onClose, onSubmit, question, initialAnswer }: { isOpen: boolean; onClose: () => void; onSubmit: (answer: string) => void; question: string; initialAnswer: string }) {
  const [answer, setAnswer] = useState(initialAnswer);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Answer Question</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-2 text-gray-700"><span className="font-semibold">Q:</span> {question}</div>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit(answer);
            onClose();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
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
              Submit Answer
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
  const [answering, setAnswering] = useState<{ id: string; question: string; answer: string } | null>(null);

  const handleAddTask = (question: string) => {
    setTasks(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        question,
        answer: '',
        status: 'pending',
        createdAt: new Date(),
      },
    ]);
  };

  const handleAnswer = (id: string, answer: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, answer, status: 'answered' }
          : task
      )
    );
  };

  const handleResolve = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? { ...task, status: 'resolved' }
          : task
      )
    );
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
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
                  <TableCell className="font-semibold text-gray-700">Status</TableCell>
                  <TableCell className="font-semibold text-gray-700">Created</TableCell>
                  <TableCell className="font-semibold text-gray-700 text-center">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-purple-50 transition-colors">
                    <TableCell className="max-w-xs whitespace-pre-line">{task.question}</TableCell>
                    <TableCell className="max-w-xs whitespace-pre-line text-gray-700">
                      {task.answer ? task.answer : <span className="italic text-gray-400">No answer yet</span>}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[task.status]}`}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                    </TableCell>
                    <TableCell>{task.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-center flex gap-2 justify-center">
                      {task.status !== 'resolved' && (
                        <button
                          onClick={() => setAnswering({ id: task.id, question: task.question, answer: task.answer })}
                          className="p-2 text-blue-500 hover:text-blue-700 rounded-full hover:bg-blue-50"
                          title="Answer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
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
                  <TableCell colSpan={2} className="text-right font-semibold">Total Questions</TableCell>
                  <TableCell colSpan={3} className="font-semibold">{tasks.length}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
      <AddTaskModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddTask} />
      {answering && (
        <AnswerModal
          isOpen={!!answering}
          onClose={() => setAnswering(null)}
          onSubmit={answer => handleAnswer(answering.id, answer)}
          question={answering.question}
          initialAnswer={answering.answer}
        />
      )}
    </div>
  );
} 