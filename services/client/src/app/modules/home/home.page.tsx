import { useState } from "react";
import type React from 'react';

const HomePage: React.FC = () => {
  const [files] = useState<Record<string, string> | null>(null);

  return (
    <div className="min-h-screen p-lg">
      <header className="mb-lg">
        <h1 className="text-4xl font-bold text-primary">
          Modulus
        </h1>
        <p className="text-text-muted mt-sm">
          AI-Powered LaTeX Content Generator
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Upload Section */}
        <section className="bg-surface p-lg border border-neutral-xstrong">
          <h2 className="text-xl font-semibold mb-md">1. Upload Materials</h2>
          <div className="space-y-md">
            <div className="border-2 border-dashed border-neutral-xstrong p-xl text-center hover:border-primary transition-colors cursor-pointer">
              <p className="text-text-muted">
                Drop your reference PDF here
              </p>
            </div>
            <div className="border-2 border-dashed border-neutral-xstrong p-xl text-center hover:border-secondary transition-colors cursor-pointer">
              <p className="text-text-muted">
                Drop your .tex templates here
              </p>
            </div>
          </div>
        </section>

        {/* Generation Section */}
        <section className="bg-surface p-lg border border-neutral-xstrong">
          <h2 className="text-xl font-semibold mb-md">2. Configure & Generate</h2>
          <form className="space-y-md">
            <div>
              <label className="block text-sm text-text-muted mb-xs">
                Subject
              </label>
              <input
                type="text"
                className="w-full bg-background-strong border border-neutral-xstrong px-md py-sm focus:outline-none focus:border-primary"
                placeholder="Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-xs">
                Topic
              </label>
              <input
                type="text"
                className="w-full bg-background-strong border border-neutral-xstrong px-md py-sm focus:outline-none focus:border-primary"
                placeholder="Logarithms"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-xs">
                Prompt
              </label>
              <textarea
                className="w-full bg-background-strong border border-neutral-xstrong px-md py-sm h-24 focus:outline-none focus:border-primary"
                placeholder="Generate 5 questions about..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-fixed-white font-semibold py-sm hover:bg-primary-strong transition-colors"
            >
              Generate Content
            </button>
          </form>
        </section>
      </main>

      {/* Results Section */}
      {files && (
        <section className="mt-lg bg-surface p-lg border border-neutral-xstrong">
          <h2 className="text-xl font-semibold mb-md">3. Generated Files</h2>
          <pre className="bg-background-strong p-md overflow-auto text-sm">
            {JSON.stringify(files, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
};

export default HomePage;