import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Code, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ProblemCard = ({ problem, onSelect }) => {
  const diffColor = 
    problem.difficulty === 'Easy' ? 'success' :
    problem.difficulty === 'Medium' ? 'warning' : 'error';

  return (
    <Card 
      onClick={onSelect}
      className="group cursor-pointer hover:border-primary-500 hover:shadow-md transition-all duration-200 border border-border"
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {problem.title}
            </h3>
            <div className="flex items-center gap-3 mt-1.5">
              <Badge variant={diffColor} size="sm">{problem.difficulty}</Badge>
              {problem.topics?.length > 0 && (
                <>
                  <span className="text-text-muted text-xs">•</span>
                  <span className="text-xs text-text-secondary truncate max-w-[200px] sm:max-w-xs">
                    {problem.topics.join(", ")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          variant="secondary" 
          size="sm" 
          rightIcon={<ChevronRight className="w-4 h-4" />}
          className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
        >
          Solve
        </Button>
      </div>
    </Card>
  );
};
