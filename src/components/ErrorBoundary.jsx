import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <section className="rounded-lg border border-rose-200 bg-rose-50 p-6 shadow-soft">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-rose-700" />
          <div>
            <h1 className="text-2xl font-bold tracking-normal text-rose-950">
              Something went wrong
            </h1>
            <p className="mt-2 text-rose-900">
              The simulator hit a runtime error while rendering this view.
            </p>
            <p className="mt-3 rounded-md bg-white/70 p-3 font-mono text-sm text-rose-900 mono-hash">
              {this.state.error.message}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
            >
              <RotateCcw className="h-4 w-4" />
              Return to Dashboard
            </button>
          </div>
        </div>
      </section>
    );
  }
}
