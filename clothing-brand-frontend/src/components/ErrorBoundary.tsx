import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { error: Error | null }

// A failed lazy chunk (e.g. after a new deploy) is fixed by a reload.
const isChunkError = (error: Error) => /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(error.message);

class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack);
    if (isChunkError(error) && !sessionStorage.getItem('rc_chunk_reload')) {
      sessionStorage.setItem('rc_chunk_reload', '1');
      window.location.reload();
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="rc-container rc-section">
        <div className="rc-empty">
          <span className="rc-eyebrow">Something went wrong</span>
          <h1 className="rc-h2">We hit an unexpected snag</h1>
          <p>Please refresh the page. If the problem continues, message us on WhatsApp and we’ll help you right away.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="rc-btn" onClick={() => window.location.reload()}>Refresh page</button>
            <a className="rc-btn rc-btn--outline" href="/">Go home</a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
