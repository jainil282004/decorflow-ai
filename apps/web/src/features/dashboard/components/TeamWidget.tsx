import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Icon } from '../../../components/ui/icon';
import { useEmployees, useTasks } from '../../workforce/api/workforceApi';
import { useDrivers } from '../../logistics/api/logisticsApi';

function isSameDay(iso: string, day = new Date()) {
  const d = new Date(iso);
  return (
    d.getFullYear() === day.getFullYear() &&
    d.getMonth() === day.getMonth() &&
    d.getDate() === day.getDate()
  );
}

export function TeamWidget() {
  const { data: employees } = useEmployees();
  const { data: tasks } = useTasks();
  const { data: drivers } = useDrivers();

  const employeeList = Array.isArray(employees) ? employees : [];
  const taskList = Array.isArray(tasks) ? tasks : [];
  const driverList = Array.isArray(drivers) ? drivers : [];

  // No live "currently checked in" attendance list endpoint — ACTIVE employees as proxy.
  const onDuty = employeeList.filter((e: { status: string }) => e.status === 'ACTIVE').length;
  const driversAssigned = driverList.filter(
    (d: { availabilityStatus: string }) => d.availabilityStatus === 'ON_TRIP'
  ).length;
  const openTasks = taskList.filter(
    (t: { status: string }) => t.status === 'TODO' || t.status === 'IN_PROGRESS'
  ).length;
  const completedTasksToday = taskList.filter(
    (t: { status: string; updatedAt?: string }) =>
      t.status === 'DONE' && t.updatedAt && isSameDay(t.updatedAt)
  ).length;

  const totalTasks = completedTasksToday + openTasks;
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasksToday / totalTasks) * 100) : 0;

  // SVG ring dimensions
  const size = 80;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completionPercent / 100) * circumference;

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
            <Icon name="UsersRound" className="h-4 w-4 text-chart-2 stroke-[1.5]" />
          </div>
          Team &amp; Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <Icon name="UserCheck" className="h-4 w-4 text-success stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tabular-nums leading-none">{onDuty}</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">On Duty</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50">
            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
              <Icon name="Truck" className="h-4 w-4 text-info stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tabular-nums leading-none">{driversAssigned}</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-1">
                Drivers Active
              </span>
            </div>
          </div>
        </div>

        {/* Task completion ring */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold tabular-nums">{completionPercent}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Task Completion</span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {completedTasksToday} Done
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-muted" />
                {openTasks} Open
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
