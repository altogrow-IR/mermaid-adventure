import { Component, type ErrorInfo, type PropsWithChildren } from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Game error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="error-fallback">
          <h1>うみのじゅんびちゅう</h1>
          <p>ゲームのよみこみにしっぱいしました。ページをもういちどひらいてください。</p>
        </section>
      );
    }

    return this.props.children;
  }
}
