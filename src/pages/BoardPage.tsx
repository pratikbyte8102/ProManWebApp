import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getIssues, transitionIssue } from '../api/issues';
import { getStatuses } from '../api/workflow';
import { getProject } from '../api/projects';
import { KanbanColumn } from '../components/issues/KanbanColumn';
import { IssueCard } from '../components/issues/IssueCard';
import { CreateIssueModal } from '../components/issues/CreateIssueModal';
import { Spinner } from '../components/ui/Spinner';
import { IssueDetail } from '../components/issues/IssueDetail';
import type { Issue } from '../types';
import toast from 'react-hot-toast';

export const BoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const qc = useQueryClient();
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [createStatusId, setCreateStatusId] = useState<string | null>(null);

  const { data: project } = useQuery({ queryKey: ['project', projectId], queryFn: () => getProject(projectId!) });
  const { data: statusesData } = useQuery({ queryKey: ['statuses', projectId], queryFn: () => getStatuses(projectId!) });
  const { data: issuesData, isLoading } = useQuery({ queryKey: ['issues', projectId], queryFn: () => getIssues(projectId!, { limit: 100 }) });

  const statuses = useMemo(() => (statusesData || []).sort((a, b) => a.position - b.position), [statusesData]);
  const issuesByStatus = useMemo(() => {
    const map: Record<string, Issue[]> = {};
    statuses.forEach(s => { map[s.id] = []; });
    (issuesData?.items || []).forEach(issue => {
      if (map[issue.statusId]) map[issue.statusId].push(issue);
    });
    return map;
  }, [issuesData, statuses]);

  const transitionMutation = useMutation({
    mutationFn: ({ id, toStatusId }: { id: string; toStatusId: string }) => transitionIssue(id, toStatusId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues', projectId] }),
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Transition failed');
    },
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issuesData?.items.find(i => i.id === event.active.id);
    setActiveIssue(issue ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return;
    const issue = issuesData?.items.find(i => i.id === active.id);
    if (!issue) return;
    const targetStatusId =
      statuses.find(s => s.id === over.id)?.id ??
      issuesData?.items.find(i => i.id === over.id)?.statusId;
    if (targetStatusId && targetStatusId !== issue.statusId) {
      transitionMutation.mutate({ id: issue.id, toStatusId: targetStatusId });
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">{project?.name}</h1>
          <p className="text-sm text-gray-500">{project?.key} · Board</p>
        </div>
      </div>
      {!statuses.length && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">⚙️</p>
          <p className="font-medium">No workflow statuses configured</p>
          <p className="text-sm mt-1">Go to Settings → Workflow to add statuses</p>
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {statuses.map(status => (
            <KanbanColumn
              key={status.id}
              status={status}
              issues={issuesByStatus[status.id] || []}
              onIssueClick={setSelectedIssue}
              onAddIssue={sid => setCreateStatusId(sid)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeIssue && <IssueCard issue={activeIssue} onClick={() => {}} />}
        </DragOverlay>
      </DndContext>
      {createStatusId && (
        <CreateIssueModal
          projectId={projectId!}
          defaultStatusId={createStatusId}
          onClose={() => setCreateStatusId(null)}
        />
      )}
      {selectedIssue && (
        <IssueDetail
          issueId={selectedIssue.id}
          projectId={projectId!}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
};
