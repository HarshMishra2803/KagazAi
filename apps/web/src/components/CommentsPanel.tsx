'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle,
  X,
  Trash2,
  Clock,
  User,
  AlertCircle,
  Loader2,
  CornerDownRight,
  Filter,
} from 'lucide-react';

export interface CommentItem {
  _id: string;
  documentId: string;
  commentId: string;
  body: string;
  parentId: string | null;
  resolved: boolean;
  createdAt: string;
  authorId: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CommentThread {
  commentId: string;
  rootComment: CommentItem;
  replies: CommentItem[];
  resolved: boolean;
}

interface CommentsPanelProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  canComment: boolean;
  activeCommentId: string | null;
  onSelectComment: (commentId: string | null) => void;
  pendingCommentId?: string | null;
  onCancelPendingComment?: () => void;
}

import { getApiUrl } from '../utils/config';

const API_URL = getApiUrl();

export function CommentsPanel({
  documentId,
  isOpen,
  onClose,
  canComment,
  activeCommentId,
  onSelectComment,
  pendingCommentId,
  onCancelPendingComment,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'active' | 'resolved'>('active');

  // New comment input for pending selection
  const [newCommentBody, setNewCommentBody] = useState('');
  const [submittingNew, setSubmittingNew] = useState(false);

  // Reply inputs keyed by thread commentId
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/comments`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to load comments');
      }

      const data = await res.json();
      setComments(data.comments || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error loading comments');
      }
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  // Group comments into threads
  const threads: CommentThread[] = useMemo(() => {
    const threadMap = new Map<string, { root: CommentItem | null; replies: CommentItem[] }>();

    comments.forEach((c) => {
      if (!threadMap.has(c.commentId)) {
        threadMap.set(c.commentId, { root: null, replies: [] });
      }
      const entry = threadMap.get(c.commentId)!;
      if (!c.parentId) {
        entry.root = c;
      } else {
        entry.replies.push(c);
      }
    });

    const list: CommentThread[] = [];
    threadMap.forEach((val, commentId) => {
      if (val.root) {
        list.push({
          commentId,
          rootComment: val.root,
          replies: val.replies.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ),
          resolved: val.root.resolved,
        });
      }
    });

    return list.sort(
      (a, b) =>
        new Date(b.rootComment.createdAt).getTime() - new Date(a.rootComment.createdAt).getTime()
    );
  }, [comments]);

  const filteredThreads = useMemo(() => {
    return threads.filter((t) => (filter === 'active' ? !t.resolved : t.resolved));
  }, [threads, filter]);

  // Handle creating top-level comment on marked text
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingCommentId || !newCommentBody.trim()) return;

    try {
      setSubmittingNew(true);
      setError(null);

      const res = await fetch(`${API_URL}/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          commentId: pendingCommentId,
          body: newCommentBody.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewCommentBody('');
      if (onCancelPendingComment) onCancelPendingComment();
      await fetchComments();
      onSelectComment(pendingCommentId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error creating comment');
      }
    } finally {
      setSubmittingNew(false);
    }
  };

  // Handle posting a reply in an existing thread
  const handlePostReply = async (commentId: string, parentId: string) => {
    const text = (replyInputs[commentId] || '').trim();
    if (!text) return;

    try {
      setSubmittingReply(commentId);
      setError(null);

      const res = await fetch(`${API_URL}/documents/${documentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          commentId,
          body: text,
          parentId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post reply');
      }

      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      await fetchComments();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error posting reply');
      }
    } finally {
      setSubmittingReply(null);
    }
  };

  // Toggle resolve status
  const handleToggleResolve = async (commentId: string, currentResolved: boolean) => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resolved: !currentResolved }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update resolve status');
      }

      await fetchComments();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error resolving comment');
      }
    }
  };

  // Delete comment or reply
  const handleDeleteComment = async (id: string) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/comments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      await fetchComments();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error deleting comment');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white border-l border-neutral-200 shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-neutral-800" />
          <h2 className="text-xs font-semibold text-neutral-900">Comments</h2>
          <span className="text-[11px] font-medium bg-neutral-200/80 text-neutral-700 px-1.5 py-0.2 rounded-full">
            {threads.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            aria-label="Close comments panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-neutral-200 px-4 bg-white text-xs shrink-0">
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`py-2 px-3 font-medium border-b-2 transition-colors ${
            filter === 'active'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Active ({threads.filter((t) => !t.resolved).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('resolved')}
          className={`py-2 px-3 font-medium border-b-2 transition-colors ${
            filter === 'resolved'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          Resolved ({threads.filter((t) => t.resolved).length})
        </button>
      </div>

      {/* Feedback Message */}
      {error && (
        <div className="m-3 p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* New Pending Comment Box */}
      {pendingCommentId && canComment && (
        <div className="p-3 bg-amber-50/60 border-b border-amber-200 shrink-0 animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-amber-700" />
              New comment on selection
            </span>
            <button
              type="button"
              onClick={onCancelPendingComment}
              className="text-[11px] text-neutral-500 hover:text-neutral-800"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateComment} className="space-y-2">
            <textarea
              required
              autoFocus
              rows={2}
              placeholder="Add your thoughts..."
              value={newCommentBody}
              onChange={(e) => setNewCommentBody(e.target.value)}
              className="w-full p-2 text-xs bg-white border border-neutral-300 rounded focus:outline-hidden focus:ring-2 focus:ring-neutral-900 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={submittingNew || !newCommentBody.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 disabled:opacity-50"
              >
                {submittingNew ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3" />
                    <span>Comment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
            <span>Loading comments...</span>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500">
            <MessageSquare className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
            <p className="font-medium text-neutral-700">No {filter} comments</p>
            <p className="mt-1 text-neutral-400">
              {filter === 'active'
                ? 'Select any text in the document and click Comment to start a discussion.'
                : 'Resolved comments will appear here.'}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const isSelected = thread.commentId === activeCommentId;
            const root = thread.rootComment;

            return (
              <div
                key={thread.commentId}
                onClick={() => onSelectComment(thread.commentId)}
                className={`p-3 bg-white border rounded-md transition-all text-xs cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {/* Thread Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-800 font-medium flex items-center justify-center text-[10px] shrink-0">
                      {root.authorId?.name ? root.authorId.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                    <span className="font-medium text-neutral-900 truncate">
                      {root.authorId?.name || 'Collaborator'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-neutral-400">
                      {formatDate(root.createdAt)}
                    </span>
                    {canComment && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleResolve(thread.commentId, thread.resolved);
                        }}
                        title={thread.resolved ? 'Re-open thread' : 'Resolve thread'}
                        className={`p-1 rounded transition-colors ${
                          thread.resolved
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-neutral-400 hover:text-emerald-600 hover:bg-neutral-100'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Root Comment Body */}
                <p className="mt-2 text-neutral-800 whitespace-pre-wrap leading-relaxed">
                  {root.body}
                </p>

                {/* Replies List */}
                {thread.replies.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-100 space-y-2">
                    {thread.replies.map((reply) => (
                      <div key={reply._id} className="pl-3 border-l-2 border-neutral-200 text-[11px]">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-neutral-800">
                            {reply.authorId?.name || 'Collaborator'}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-neutral-700 whitespace-pre-wrap">
                          {reply.body}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input (Only for active threads and permitted users) */}
                {!thread.resolved && canComment && (
                  <div className="mt-2.5 pt-2 border-t border-neutral-100">
                    <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        placeholder="Reply..."
                        value={replyInputs[thread.commentId] || ''}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({
                            ...prev,
                            [thread.commentId]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handlePostReply(thread.commentId, root._id);
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs bg-neutral-50 border border-neutral-200 rounded focus:outline-hidden focus:ring-1 focus:ring-neutral-900 focus:bg-white"
                      />
                      <button
                        type="button"
                        disabled={
                          submittingReply === thread.commentId ||
                          !(replyInputs[thread.commentId] || '').trim()
                        }
                        onClick={() => handlePostReply(thread.commentId, root._id)}
                        className="p-1.5 bg-neutral-900 text-white rounded hover:bg-neutral-800 disabled:opacity-40 transition-colors"
                        title="Post reply"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
