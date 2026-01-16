import React, { Component, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Could send to error tracking service here
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center mb-4"
          >
            <span className="text-[40px]">😵</span>
          </motion.div>

          <h2 className="text-[18px] font-bold text-charcoal mb-2">
            哎呀！出錯了
          </h2>
          <p className="text-stone mb-6">發生了一些問題，請點擊下方按鈕重試</p>

          {/* Debug Info for User */}
          <div className="w-full max-w-xs bg-red-50 p-3 rounded-lg border border-red-100 mb-6 text-left overflow-hidden">
            <p className="text-[10px] text-red-500 font-mono break-all font-bold mb-1">
              Error: {this.state.error?.message || 'Unknown Error'}
            </p>
            <details className="text-[10px] text-red-400 font-mono whitespace-pre-wrap">
              <summary>Stack Trace</summary>
              {this.state.errorInfo?.componentStack || 'No stack trace'}
            </details>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#F43F5E] text-white rounded-full font-bold shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
          >
            重新載入
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left w-full max-w-sm">
              <summary className="text-[12px] text-stone cursor-pointer">技術詳情</summary>
              <pre className="mt-2 p-3 bg-stone/10 rounded-mag text-[10px] text-stone overflow-auto">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
