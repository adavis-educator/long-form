'use client';

import { useState, useEffect } from 'react';
import {
  BookFormData,
  BookStatus,
  ConsumptionType,
  ListenPlatform,
  ReadFormat,
} from '@/types';

interface AddBookFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookFormData) => Promise<void>;
  defaultStatus?: BookStatus;
}

export function AddBookForm({
  isOpen,
  onClose,
  onSubmit,
  defaultStatus = 'want_to_read',
}: AddBookFormProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<BookStatus>(defaultStatus);
  const [notes, setNotes] = useState('');
  const [consumptionType, setConsumptionType] = useState<ConsumptionType | ''>('');
  const [listenPlatform, setListenPlatform] = useState<ListenPlatform | ''>('');
  const [readFormat, setReadFormat] = useState<ReadFormat | ''>('');
  const [recommendedBy, setRecommendedBy] = useState('');
  const [completedAt, setCompletedAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStatus(defaultStatus);
      // Default to today's date for new books
      setCompletedAt(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, defaultStatus]);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setStatus(defaultStatus);
    setNotes('');
    setConsumptionType('');
    setListenPlatform('');
    setReadFormat('');
    setRecommendedBy('');
    setCompletedAt(new Date().toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;

    setSubmitting(true);
    try {
      const data: BookFormData = {
        title: title.trim(),
        author: author.trim(),
        status,
        notes: notes.trim() || undefined,
        consumptionType: consumptionType || undefined,
        listenPlatform: consumptionType === 'listen' ? (listenPlatform || undefined) : undefined,
        readFormat: consumptionType === 'read' ? (readFormat || undefined) : undefined,
        recommendedBy: recommendedBy.trim() || undefined,
        completedAt: status === 'have_read' && completedAt
          ? new Date(completedAt).toISOString()
          : undefined,
      };

      await onSubmit(data);
      resetForm();
      onClose();
    } catch {
      // Error handling is done in the hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 z-40"
        onClick={handleClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">Add Book</h2>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-ink-faint hover:text-ink-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-white"
              placeholder="Book title"
              required
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">
              Author *
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-white"
              placeholder="Author name"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
              className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-white"
            >
              <option value="want_to_read">Want to Read</option>
              <option value="currently_reading">Currently Reading</option>
              <option value="have_read">Have Read</option>
            </select>
          </div>

          {/* Have Read Options */}
          {status === 'have_read' && (
            <>
              <div>
                <label className="block text-sm font-medium text-ink-light mb-1">
                  How did you consume it?
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setConsumptionType('read');
                      setListenPlatform('');
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      consumptionType === 'read'
                        ? 'bg-leather/10 border-leather text-leather'
                        : 'border-parchment text-ink-light hover:bg-parchment/50'
                    }`}
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConsumptionType('listen');
                      setReadFormat('');
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                      consumptionType === 'listen'
                        ? 'bg-leather/10 border-leather text-leather'
                        : 'border-parchment text-ink-light hover:bg-parchment/50'
                    }`}
                  >
                    Listened
                  </button>
                </div>
              </div>

              {consumptionType === 'listen' && (
                <div>
                  <label className="block text-sm font-medium text-ink-light mb-1">
                    Platform
                  </label>
                  <div className="flex gap-2">
                    {(['audible', 'libby', 'spotify'] as ListenPlatform[]).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => setListenPlatform(platform)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          listenPlatform === platform
                            ? 'bg-leather/10 border-leather text-leather'
                            : 'border-parchment text-ink-light hover:bg-parchment/50'
                        }`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {consumptionType === 'read' && (
                <div>
                  <label className="block text-sm font-medium text-ink-light mb-1">
                    Format
                  </label>
                  <div className="flex gap-3">
                    {(['paper', 'digital'] as ReadFormat[]).map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => setReadFormat(format)}
                        className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                          readFormat === format
                            ? 'bg-leather/10 border-leather text-leather'
                            : 'border-parchment text-ink-light hover:bg-parchment/50'
                        }`}
                      >
                        {format.charAt(0).toUpperCase() + format.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Completed */}
              <div>
                <label className="block text-sm font-medium text-ink-light mb-1">
                  Date finished
                </label>
                <input
                  type="date"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                  className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-white"
                />
              </div>
            </>
          )}

          {/* Want to Read Options */}
          {status === 'want_to_read' && (
            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                Recommended by (optional)
              </label>
              <input
                type="text"
                value={recommendedBy}
                onChange={(e) => setRecommendedBy(e.target.value)}
                className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base bg-white"
                placeholder="Who recommended this book?"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-parchment rounded-lg focus:ring-2 focus:ring-leather/30 focus:border-leather text-base resize-none bg-white"
              placeholder="Any notes about this book..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!title.trim() || !author.trim() || submitting}
            className="w-full py-3 px-4 bg-leather text-white font-medium rounded-lg hover:bg-leather-light disabled:bg-ink-faint disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>
    </>
  );
}
