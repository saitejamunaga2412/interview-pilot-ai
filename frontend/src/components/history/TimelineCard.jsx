import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Trash2, ExternalLink, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TimelineCard = ({ activity, onDelete }) => {
  const navigate = useNavigate();

  const handleView = () => {
    if (activity.type === 'interview') {
      navigate(`/history/${activity.id}`);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'interview': return 'primary';
      case 'coding': return 'warning';
      case 'learning': return 'emerald';
      case 'resume': return 'purple';
      case 'career': return 'pink';
      default: return 'secondary';
    }
  };

  return (
    <Card className="border-border hover:shadow-md transition-shadow relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full bg-${getTypeColor(activity.type)}-500`} />
      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={getTypeColor(activity.type)} className="uppercase tracking-wide text-[10px]">
              {activity.type}
            </Badge>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {activity.timestamp.toLocaleString()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-text-primary leading-tight">{activity.title}</h3>
          <p className="text-sm text-text-secondary mt-1">{activity.description}</p>
        </div>
        
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4 min-w-[120px]">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-warning-400 fill-warning-400" />
            <span className="font-bold text-text-primary text-xl">{activity.score}</span>
            <span className="text-xs text-text-muted">/100</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20" onClick={() => onDelete(activity.id, activity.type)}>
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleView}>
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
