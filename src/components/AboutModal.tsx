'use client';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-cream rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-cream border-b border-parchment px-4 py-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-ink">About Long Form Circle</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-ink-faint hover:text-ink-light"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tagline */}
          <div className="text-center">
            <p className="text-ink-light italic text-lg">For those who still read the whole book</p>
          </div>

          {/* What it is */}
          <div>
            <h3 className="font-serif text-lg text-ink mb-2">What is Long Form Circle?</h3>
            <p className="text-ink-light">
              A simple way to track your reading life. Keep tabs on what you&apos;re currently reading,
              books you&apos;ve finished, and what&apos;s next on your list. No ratings, no reviews, no
              noise - just your books.
            </p>
          </div>

          {/* Reading Circle */}
          <div>
            <h3 className="font-serif text-lg text-ink mb-2">Reading Circles</h3>
            <p className="text-ink-light mb-3">
              Connect with friends who share your love of books. Your reading circle is a small,
              private group for sharing recommendations.
            </p>
            <ul className="space-y-2 text-ink-light">
              <li className="flex items-start gap-2">
                <span className="text-leather mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span><strong>Recommend books</strong> you&apos;ve loved to specific friends</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-leather mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span><strong>Ask for suggestions</strong> when you need something new to read</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-leather mt-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
                <span><strong>Public shelf</strong> - show friends what you&apos;ve enjoyed so they know your taste</span>
              </li>
            </ul>
          </div>

          {/* How to use */}
          <div>
            <h3 className="font-serif text-lg text-ink mb-2">Getting Started</h3>
            <ol className="space-y-2 text-ink-light list-decimal list-inside">
              <li>Add books to your lists using the + button</li>
              <li>Drag books between sections as your reading progresses</li>
              <li>Invite friends to your circle using their username</li>
              <li>Curate your public shelf to help friends recommend books you&apos;ll love</li>
            </ol>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-parchment text-center">
            <p className="text-ink-faint text-sm">
              Made for readers, by readers.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
