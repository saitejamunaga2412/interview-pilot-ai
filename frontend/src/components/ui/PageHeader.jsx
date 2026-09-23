import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * PageHeader — consistent page title + breadcrumbs + optional action slot
 */
export const PageHeader = ({
  title,
  subtitle,
  breadcrumbs, // array of { label, href }
  actions,
  icon: Icon,
  className,
}) => {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-text-muted mb-2" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-text-secondary transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-text-secondary font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {subtitle && (
              <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
