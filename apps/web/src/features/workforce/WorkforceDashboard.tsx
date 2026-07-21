import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/ui/button';
import { Plus, Users, UserCircle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { useEmployees, useTeams } from './api/workforceApi';

export const WorkforceDashboard = () => {
  const navigate = useNavigate();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Workforce Management"
        description="Manage employees, teams, and daily attendance."
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/workforce/teams/new')}>
            <Plus className="w-4 h-4 mr-2" /> Create Team
          </Button>
          <Button onClick={() => navigate('/workforce/employees/new')}>
            <Plus className="w-4 h-4 mr-2" /> Add Employee
          </Button>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-background border">
          <TabsTrigger value="employees" className="gap-2">
            <UserCircle className="w-4 h-4" /> Employees
          </TabsTrigger>
          <TabsTrigger value="teams" className="gap-2">
            <Users className="w-4 h-4" /> Teams
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <Clock className="w-4 h-4" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarIcon className="w-4 h-4" /> Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : employees?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  employees?.map((emp: any) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">
                        {emp.user?.name}
                        <div className="text-xs text-muted-foreground">{emp.user?.email}</div>
                      </TableCell>
                      <TableCell>{emp.employeeCode || '-'}</TableCell>
                      <TableCell>{emp.department || '-'}</TableCell>
                      <TableCell>{emp.position || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            emp.status === 'ACTIVE'
                              ? 'default'
                              : emp.status === 'ON_LEAVE'
                                ? 'outline'
                                : 'destructive'
                          }
                        >
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamsLoading ? (
              <div className="col-span-full text-center text-muted-foreground p-12">
                Loading teams...
              </div>
            ) : teams?.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground p-12">
                No teams found.
              </div>
            ) : (
              teams?.map((team: any) => (
                <Card key={team.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{team.name}</span>
                      <Badge variant="secondary">{team.members?.length || 0} Members</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {team.description && (
                      <p className="text-sm text-muted-foreground">{team.description}</p>
                    )}

                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Team Leader
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {team.leader?.user?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Skills
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {team.skills ? (
                          team.skills.split(',').map((skill: string) => (
                            <Badge key={skill} variant="outline" className="text-[10px]">
                              {skill.trim()}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">None listed</span>
                        )}
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full mt-2 border border-dashed">
                      Manage Team
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">Daily Attendance Log</h3>
            <p>View check-ins, check-outs, and calculate overtimes for today.</p>
            <Button className="mt-4" variant="outline">
              Simulate Check-In
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="p-12 text-center text-muted-foreground border-dashed">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-foreground mb-1">Workforce Schedule</h3>
            <p>Visual timeline for employee and team event assignments.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
