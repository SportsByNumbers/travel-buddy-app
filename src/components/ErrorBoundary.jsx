// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
    // You might send this to a service like Sentry, Bugsnag, etc.
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-8 my-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Oops! Something went wrong.</h2>
          <p className="mb-2">We're sorry, but there was an error rendering this section.</p>
          <p className="mb-4">Please try refreshing the page. If the problem persists, contact support.</p>
          {/* In development, you might show more details */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 p-2 bg-red-50 rounded-md text-sm">
              <summary>Error Details</summary>
              <pre className="whitespace-pre-wrap break-all text-xs">{this.state.error.toString()}</pre>
              <pre className="whitespace-pre-wrap break-all text-xs">{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
