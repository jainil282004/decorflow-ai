import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent } from '../../components/ui/card';
import { HardHat } from 'lucide-react';

export const ComingSoonPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Coming Soon" description="This module is currently under construction" />
      <Card className="border-dashed bg-secondary/5">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <HardHat className="h-16 w-16 mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Work in Progress</h2>
          <p className="max-w-md text-sm">
            We're building something amazing here. Please check back later.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
