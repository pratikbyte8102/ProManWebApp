import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getIssueActivity } from '../../api/activity';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeed: React.FC<{ issueId: string }> = ({ issueId }) => {
  const { data: logs } = useQuery({
    queryKey: ['activity', issueId],
    queryFn: () => getIssueActivity(issueId),
  });

  return (
    <div className="flex flex-col gap-3">
      {!logs?.length && <p className="text-gray-400 text-sm">No activity yet</p>}
      {logs?.map(log => (
        <div key={log.id} className="flex gap-3 text-sm">
          <Avatar name={log.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-gray-800">{log.displayName}</span>{' '}
            <span className="text-gray-600">{log.action.toLowerCase().replace(/_/g, ' ')}</span>
            {log.fieldChanged && (
              <span className="text-gray-500">
                {' · '}<span className="font-medium">{log.fieldChanged}</span>
                {log.oldValue && <> from <span className="line-through text-red-400">{log.oldValue}</span></>}
                {log.newValue && <> to <span className="text-green-600">{log.newValue}</span></>}
              </span>
            )}
            <div className="text-xs text-gray-400 mt-0.5">
              {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
