"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4" role="alert" aria-live="assertive">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                <CardTitle>예기치 않은 오류가 발생했습니다</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">
                {this.state.error?.message ||
                  "애플리케이션에서 예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 돌아가주세요."}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button 
                  onClick={this.handleReset} 
                  variant="outline" 
                  className="flex-1"
                  aria-label="오류를 무시하고 다시 시도"
                >
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  다시 시도
                </Button>
                <Button asChild variant="default" className="flex-1" aria-label="홈 페이지로 이동">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                    홈으로 돌아가기
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

