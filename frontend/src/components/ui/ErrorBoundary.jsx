import React from 'react';
import { ErrorState } from './States';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-base flex items-center justify-center p-4">
          <ErrorState 
            title="Application Error" 
            description="We encountered an unexpected error. Please reload the application."
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
