import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProjectActivity } from '../api/activity';
import { getProject } from '../api/projects';
import { Spinner } from '../components/ui/Spinner';

export const ActivityPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['project-activity', projectId],
    queryFn: () => getProjectActivity(projectId!),
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy-800">{project?.name}</h1>
        <p className="text-sm text-gray-500">{project?.key} · Activity</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-xl border p-6">
          {!logs?.length ? (
            <p className="text-center text-gray-400 py-8">No activity yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {logs.map(log => (
                <div key={log.id} className="flex gap-3 text-sm border-b pb-4 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-brand-orange mt-2 flex-shrink-0" />
                  <div className="flex-1">
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
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
