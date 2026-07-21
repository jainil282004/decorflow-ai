import { PageHeader } from '../../components/PageHeader';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useOrganization, useSubscriptionPlans, useUpgradeSubscription } from './api/saasApi';
import { CheckCircle2, Zap } from 'lucide-react';

export const SubscriptionManager = () => {
  const { data: org } = useOrganization();
  const { data: plans } = useSubscriptionPlans();
  const upgradeMutation = useUpgradeSubscription();

  const currentSubscription = org?.subscription;
  const currentPlan = currentSubscription?.plan;

  // Mock usage data based on actual limits
  const usersCount = org?.users?.length || 1;
  const maxUsers = currentPlan?.maxUsers || 5; // Fallback if no plan
  const eventsCount = 3; // Mock current usage
  const maxEvents = currentPlan?.maxEvents || 10;

  const handleUpgrade = (planId: string) => {
    upgradeMutation.mutate({ planId });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription & Billing"
        description="Manage your plan, limits, and billing cycle"
      />

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-xl">Current Plan</CardTitle>
            <CardDescription>
              {currentSubscription?.status === 'ACTIVE' ? (
                <Badge className="bg-green-600 mt-2">Active</Badge>
              ) : (
                <Badge variant="destructive" className="mt-2">
                  Past Due
                </Badge>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold tracking-tight">
                {currentPlan?.name || 'Free Trial'}
              </p>
              <p className="text-muted-foreground mt-1">
                ${currentPlan?.price || 0} /{' '}
                {currentPlan?.billingCycle === 'YEARLY' ? 'year' : 'month'}
              </p>
            </div>
            {currentSubscription?.renewalDate && (
              <p className="text-sm text-muted-foreground">
                Renews on {new Date(currentSubscription.renewalDate).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Usage Limits</CardTitle>
            <CardDescription>Your organization's current resource consumption.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Active Users</span>
                <span className="text-muted-foreground">
                  {usersCount} / {maxUsers}
                </span>
              </div>
              <Progress value={(usersCount / maxUsers) * 100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Monthly Events</span>
                <span className="text-muted-foreground">
                  {eventsCount} / {maxEvents}
                </span>
              </div>
              <Progress value={(eventsCount / maxEvents) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan: any) => (
            <Card
              key={plan.id}
              className={currentPlan?.id === plan.id ? 'border-primary shadow-sm' : ''}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${plan.price}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{plan.billingCycle.toLowerCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> Up to {plan.maxUsers}{' '}
                    Users
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> {plan.maxEvents} Events /
                    mo
                  </li>
                  {JSON.parse(plan.features || '[]').map((f: string) => (
                    <li key={f} className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-primary" /> {f} Module
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={currentPlan?.id === plan.id ? 'outline' : 'default'}
                  disabled={currentPlan?.id === plan.id || upgradeMutation.isPending}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {currentPlan?.id === plan.id ? (
                    'Current Plan'
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" /> Upgrade
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
