import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment, deleteComment } from '../../api/comments';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export const CommentList: React.FC<{ issueId: string }> = ({ issueId }) => {
  const qc = useQueryClient();
  const [body, setBody] = useState('');
  const { data: comments } = useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => getComments(issueId),
  });

  const addMutation = useMutation({
    mutationFn: () => createComment(issueId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', issueId] });
      setBody('');
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', issueId] }),
  });

  return (
    <div className="flex flex-col gap-4">
      {comments?.map(c => (
        <div key={c.id} className="flex gap-3">
          <Avatar name={c.author.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{c.author.displayName}</span>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{c.body}</p>
            <button
              onClick={() => deleteMutation.mutate(c.id)}
              className="text-xs text-gray-400 hover:text-red-500 mt-1"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      <div className="mt-2">
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-orange outline-none resize-none"
          rows={3}
          placeholder="Add a comment..."
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <Button
          size="sm"
          className="mt-2"
          onClick={() => addMutation.mutate()}
          loading={addMutation.isPending}
          disabled={!body.trim()}
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
};
