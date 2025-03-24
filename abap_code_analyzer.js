/** @jsxImportSource https://esm.sh/react@18.2.0 */
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import React, { useState } from "https://esm.sh/react@18.2.0";

function ABAPCodeAnalyzer() {
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/analyze", {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis({
        error: "Code analysis failed. Please try again.",
        suggestions: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="abap-analyzer">
      <h1>🔍 ABAP Code Analyzer</h1>
      <textarea
        rows={10}
        placeholder="Paste your ABAP code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        onClick={analyzeCode}
        disabled={isLoading || !code.trim()}
      >
        {isLoading ? "Analyzing..." : "Analyze Code"}
      </button>

      {analysis && (
        <div className="analysis-results">
          <h2>Analysis Results</h2>
          {analysis.error && <div className="error">{analysis.error}</div>}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <ul>
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index}>
                  <strong>{suggestion.type}</strong>: {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <a
        href={import.meta.url.replace("esm.town", "val.town")}
        target="_top"
        style={{ color: "#888", fontSize: "0.8em", marginTop: "10px", display: "block" }}
      >
        View Source
      </a>
    </div>
  );
}

function client() {
  createRoot(document.getElementById("root")).render(<ABAPCodeAnalyzer />);
}
if (typeof document !== "undefined") { client(); }

export default async function server(request: Request): Promise<Response> {
  if (request.method === "POST" && new URL(request.url).pathname === "/analyze") {
    try {
      const { OpenAI } = await import("https://esm.town/v/std/openai");
      const openai = new OpenAI();

      const { code } = await request.json();

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert ABAP code analyzer. Analyze the following ABAP code and provide:
            1. Performance optimization suggestions
            2. Potential anti-patterns or code smells
            3. Best practice recommendations
            4. Specific improvements for readability and efficiency
            
            Respond in a structured JSON format with an array of suggestions, each containing:
            - type: Category of suggestion (Performance, Best Practice, Readability, etc.)
            - description: Detailed explanation of the suggestion`,
          },
          {
            role: "user",
            content: code,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
      });

      const analysisResult = JSON.parse(completion.choices[0].message.content);

      return new Response(JSON.stringify(analysisResult), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Analysis failed",
          suggestions: [],
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  return new Response(
    `
    <html>
      <head>
        <title>ABAP Code Analyzer</title>
        <style>${css}</style>
      </head>
      <body>
        <div id="root"></div>
        <script src="https://esm.town/v/std/catch"></script>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}

const css = `
body {
  font-family: 'Arial', sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f4f4f4;
}
.abap-analyzer {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #cccccc;
}
.analysis-results {
  margin-top: 20px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
}
.error {
  color: red;
  font-weight: bold;
}
`;

"Added ABAP Code Analyzer"
