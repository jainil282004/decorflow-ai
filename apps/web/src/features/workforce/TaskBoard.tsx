import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Plus, Clock, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { useTasks, useToggleTaskChecklist } from './api/workforceApi';
import { Progress } from '../../components/ui/progress';

export const TaskBoard = () => {
  const { data: tasks, isLoading } = useTasks();
  const toggleChecklist = useToggleTaskChecklist();

  if (isLoading) return <div className="p-12 text-center">Loading Tasks...</div>;

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'border-slate-200 bg-slate-50/50' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-blue-200 bg-blue-50/50' },
    { id: 'DONE', title: 'Done', color: 'border-emerald-200 bg-emerald-50/50' },
  ];

  return (
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-500">
      <PageHeader
        title="Task Management"
        description="Kanban board for tracking operational tasks across the team."
      >
        <Button>
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </PageHeader>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {columns.map((col) => (
          <div key={col.id} className={`flex flex-col h-full rounded-xl border ${col.color} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{col.title}</h3>
              <Badge variant="secondary" className="bg-background">
                {tasks?.filter((t: any) => t.status === col.id).length || 0}
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {tasks
                ?.filter((t: any) => t.status === col.id)
                .map((task: any) => (
                  <Card key={task.id} className="cursor-grab hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                        <Badge
                          variant={
                            task.priority === 'HIGH'
                              ? 'destructive'
                              : task.priority === 'MEDIUM'
                                ? 'default'
                                : 'secondary'
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                          <Clock className="w-3 h-3" /> Due{' '}
                          {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                        </div>
                      )}

                      {task.checklists && task.checklists.length > 0 && (
                        <div className="space-y-2 border-t pt-2 mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span className="flex items-center gap-1">
                              <CheckSquare className="w-3 h-3" /> Checklists
                            </span>
                            <span>
                              {task.checklists.filter((c: any) => c.isCompleted).length}/
                              {task.checklists.length}
                            </span>
                          </div>
                          <Progress
                            value={
                              (task.checklists.filter((c: any) => c.isCompleted).length /
                                task.checklists.length) *
                              100
                            }
                            className="h-1.5"
                          />
                          <div className="space-y-1">
                            {task.checklists.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={item.isCompleted}
                                  onChange={(e) => {
                                    toggleChecklist.mutate({
                                      taskId: task.id,
                                      itemId: item.id,
                                      isCompleted: e.target.checked,
                                    });
                                  }}
                                  className="rounded-sm w-3 h-3 text-primary border-muted-foreground cursor-pointer"
                                />
                                <span
                                  className={
                                    item.isCompleted ? 'line-through text-muted-foreground' : ''
                                  }
                                >
                                  {item.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {task.assignments && task.assignments.length > 0 && (
                        <div className="flex -space-x-2 pt-2 border-t">
                          {task.assignments.map((assignment: any) => (
                            <div
                              key={assignment.id}
                              className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-medium border-2 border-background"
                              title={assignment.assignee?.name}
                            >
                              {assignment.assignee?.name?.substring(0, 2).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
