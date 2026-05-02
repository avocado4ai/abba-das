'use client';

import React, { ReactNode, ReactElement } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-[200px] flex items-center justify-center p-6 bg-red-500/5 rounded-2xl border border-red-500/20">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600 mb-2">משהו השתבש</h3>
                <p className="text-sm text-red-500/80">אנא רענן את הדף או נסה שוב מאוחר יותר</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg text-sm font-bold transition-colors"
              >
                רענן את הדף
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
