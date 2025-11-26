import React from "react";

export default class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen" style={{ padding: "2rem", color: "white" }}>
          <h2>Something went wrong</h2>
          <p>Try refreshing the app.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
