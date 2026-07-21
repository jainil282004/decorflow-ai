import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useOrganization, useInvitations, useInviteUser, useSuspendUser } from './api/saasApi';
import { Mail } from 'lucide-react';

export const UserDirectory = () => {
  const { data: org } = useOrganization();
  const { data: invitations } = useInvitations();
  const inviteMutation = useInviteUser();
  const suspendMutation = useSuspendUser();

  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = () => {
    if (inviteEmail) {
      inviteMutation.mutate({ email: inviteEmail });
      setInviteEmail('');
    }
  };

  const handleSuspend = (userId: string, isLocked: boolean) => {
    suspendMutation.mutate({ userId, isLocked });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Access Management"
        description="Invite users, manage roles, and monitor access"
      />

      <Card className="mb-6 bg-secondary/5 border-secondary/20">
        <CardContent className="p-6 flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Invite new user</label>
            <Input
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
            <Mail className="mr-2 h-4 w-4" /> Send Invite
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Active Users */}
                {org?.users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isSuperAdmin ? (
                        <Badge variant="default" className="bg-purple-600">
                          Super Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isLocked ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!user.isSuperAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={user.isLocked ? 'text-green-600' : 'text-destructive'}
                          onClick={() => handleSuspend(user.id, !user.isLocked)}
                        >
                          {user.isLocked ? 'Unsuspend' : 'Suspend'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}

                {/* Pending Invitations */}
                {invitations
                  ?.filter((i: any) => i.status === 'PENDING')
                  .map((inv: any) => (
                    <TableRow key={inv.id} className="opacity-60 bg-muted/30">
                      <TableCell className="italic text-muted-foreground">
                        Pending Invite...
                      </TableCell>
                      <TableCell>{inv.email}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Badge variant="secondary">Invited</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
