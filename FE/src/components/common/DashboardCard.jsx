import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function DashboardCard({ title, value, description, icon: Icon, trend }) {
  return (
    <Card className="border border-border hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

export { DashboardCard };
