import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Kompakter Fallback für Inline-Bereiche wie Charts */
  variant?: 'full' | 'compact';
  /** Optionaler Titel für den Fehler-Fallback */
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { variant = 'full', fallbackTitle } = this.props;

    if (variant === 'compact') {
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl border border-red-200 text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mb-2" />
          <p className="text-sm font-medium text-red-800 mb-1">
            {fallbackTitle || 'Darstellungsfehler'}
          </p>
          <p className="text-xs text-red-600 mb-3">
            {this.state.error?.message || 'Unbekannter Fehler'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Erneut versuchen
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {fallbackTitle || 'Ein Fehler ist aufgetreten'}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {this.state.error?.message || 'Unbekannter Fehler'}
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }
}
