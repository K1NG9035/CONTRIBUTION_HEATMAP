import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <main className="page-shell flex min-h-screen flex-col items-center justify-center text-center">
      <div className="panel p-8 sm:p-12">
        <p className="label">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted">The page you were looking for doesn't exist.</p>
        <Link to="/" className="button-primary mt-6">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
