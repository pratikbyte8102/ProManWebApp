import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, getUnreadCount, markRead, markAllRead } from '../../api/notifications';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<string, string> = {
  ASSIGNED: '👤', MENTIONED: '💬', STATUS_CHANGED: '🔄', COMMENT_ADDED: '🗨️',
};

const typeLabel: Record<string, string> = {
  ASSIGNED: 'assigned you to',
  MENTIONED: 'mentioned you in',
  STATUS_CHANGED: 'changed status of',
  COMMENT_ADDED: 'commented on',
};

export const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data: countData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
    enabled: open,
  });
  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });
  const unreadCount = countData?.unreadCount ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/10"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 bg-white rounded-xl shadow-2xl border w-80 z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-bold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={() => markAllMutation.mutate()} className="text-xs text-brand-orange hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y">
              {!notifications?.length && (
                <p className="text-center text-gray-400 py-8 text-sm">No notifications</p>
              )}
              {notifications?.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markReadMutation.mutate(n.id)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer flex gap-3 ${n.read ? 'opacity-60' : ''}`}
                >
                  <span className="text-xl flex-shrink-0">{typeIcons[n.type] ?? '🔔'}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">{n.actorDisplayName}</span>{' '}
                      {typeLabel[n.type] ?? 'interacted with'}{' '}
                      <span className="text-brand-orange font-medium">{n.issueKey}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-brand-orange rounded-full flex-shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
