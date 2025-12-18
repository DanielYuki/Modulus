import { useState } from "react";

function App() {
  const [files, setFiles] = useState<Record<string, string> | null>(null);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Modulus
        </h1>
        <p className="text-[--color-text-muted] mt-2">
          AI-Powered LaTeX Content Generator
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <section className="bg-[--color-surface] rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">1. Upload Materials</h2>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
              <p className="text-[--color-text-muted]">
                Drop your reference PDF here
              </p>
            </div>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <p className="text-[--color-text-muted]">
                Drop your .tex templates here
              </p>
            </div>
          </div>
        </section>

        {/* Generation Section */}
        <section className="bg-[--color-surface] rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">2. Configure & Generate</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm text-[--color-text-muted] mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Mathematics"
              />
            </div>
            <div>
              <label className="block text-sm text-[--color-text-muted] mb-1">
                Topic
              </label>
              <input
                type="text"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                placeholder="Logarithms"
              />
            </div>
            <div>
              <label className="block text-sm text-[--color-text-muted] mb-1">
                Prompt
              </label>
              <textarea
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 h-24 focus:outline-none focus:border-blue-500"
                placeholder="Generate 5 questions about..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Generate Content
            </button>
          </form>
        </section>
      </main>

      {/* Results Section */}
      {files && (
        <section className="mt-8 bg-[--color-surface] rounded-2xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">3. Generated Files</h2>
          <pre className="bg-black/30 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(files, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}

export default App;
