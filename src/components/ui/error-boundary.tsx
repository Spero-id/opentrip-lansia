"use client";

import { Component } from "react";
import type { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

const FALLBACK_MESSAGE = "Bagian ini gagal dimuat.";

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(): void {
    this.setState({ failed: true });
  }

  render(): ReactNode {
    if (this.state.failed) {
      return this.props.fallback ?? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {FALLBACK_MESSAGE}
        </div>
      );
    }
    return this.props.children;
  }
}
