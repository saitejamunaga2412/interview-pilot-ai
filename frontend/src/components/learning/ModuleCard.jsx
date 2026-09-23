import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ModuleCard = ({ title, status, topics = [], onStartTopic }) => {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <Card className={cn("border-border overflow-hidden transition-all duration-200", isLocked ? "opacity-75 bg-surface-hover" : "hover:border-primary-400 hover:shadow-md")}>
      <CardHeader className={cn("border-b border-border pb-4", isLocked ? "bg-surface-hover" : "bg-surface")}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {isLocked && <Lock className="w-4 h-4 text-text-muted" />}
              {isCompleted && <CheckCircle2 className="w-5 h-5 text-success-500" />}
              {title}
            </CardTitle>
          </div>
          <Badge variant={isCompleted ? 'success' : isLocked ? 'secondary' : 'primary'}>
            {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'In Progress'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {topics.map((topic, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between group">
              <span className={cn("text-sm font-medium", isLocked ? "text-text-muted" : "text-text-primary")}>
                {topic.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={isLocked}
                onClick={() => onStartTopic(topic.id)}
                rightIcon={!isLocked && <ChevronRight className="w-4 h-4" />}
                className={isLocked ? "" : "text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"}
              >
                {isLocked ? "Prerequisite Required" : "Start"}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
