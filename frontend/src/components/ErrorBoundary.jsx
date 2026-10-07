import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { err: null };
  static getDerivedStateFromError(err) { return { err }; }
  render() { return this.state.err ? <div className="wrap empty"><h2>Something went wrong</h2><p className="muted">{String(this.state.err.message)}</p><button className="btn" onClick={() => (location.href = '/')}>Back to home</button></div> : this.props.children; }
}
