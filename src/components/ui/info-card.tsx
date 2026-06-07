import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  button?: React.ReactNode;
  className?: string;
}

export function InfoCard({ icon, title, description, button, className }: InfoCardProps) {
  return (
    <Card className={cn("card-hover border-border bg-card", className)}>
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-primary">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
        {button && (
          <div className="pt-2">
            {button}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
