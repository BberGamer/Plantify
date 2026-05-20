import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function EmptyState({ icon: Icon, title, description, action, children }) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        {action && (
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-primary to-green-600"
          >
            {action.label}
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export { EmptyState };
