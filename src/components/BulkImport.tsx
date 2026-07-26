import { useState, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ArrowRight,
  RefreshCw,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── CSV Template content ───
const CSV_TEMPLATE = `customerName,email,product,rating,category,message
Alice Johnson,alice@example.com,Mobile App,5,Praise,"Absolutely love the product!"
Bob Smith,bob@example.com,Desktop App,2,Complaint,"The app crashes when I export data."
Carol Lee,carol@example.com,Web Platform,4,Feature Request,"Would love to see dark mode support."`;

// ─── CSV parsing ───
function parseCSV(text: string): {
  entries: Array<{
    customerName: string;
    email: string;
    product: string;
    rating: number;
    category: string;
    sentiment: "positive" | "negative" | "neutral";
    message: string;
  }>;
  errors: string[];
  total: number;
} {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) {
    return { entries: [], errors: ["CSV file must have a header row and at least one data row"], total: 0 };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const required = ["customername", "message"];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length > 0) {
    return {
      entries: [],
      errors: [`Missing required columns: ${missing.join(", ")}. Required: customerName, message`],
      total: 0,
    };
  }

  const idx = {
    customerName: headers.indexOf("customername"),
    email: headers.indexOf("email"),
    product: headers.indexOf("product"),
    rating: headers.indexOf("rating"),
    category: headers.indexOf("category"),
    message: headers.indexOf("message"),
  };

  const entries: Array<{
    customerName: string;
    email: string;
    product: string;
    rating: number;
    category: string;
    sentiment: "positive" | "negative" | "neutral";
    message: string;
  }> = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle quoted CSV values properly
    const values = parseCSVLine(line);
    const lineNum = i + 1;

    const getVal = (colIdx: number) => (colIdx >= 0 && colIdx < values.length ? values[colIdx].trim() : "");

    const customerName = getVal(idx.customerName);
    const message = getVal(idx.message);

    if (!customerName || !message) {
      errors.push(`Row ${lineNum}: Missing customerName or message (skipped)`);
      continue;
    }

    const email = getVal(idx.email) || `${customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    const product = getVal(idx.product) || "General";
    const category = getVal(idx.category) || "General";

    let rating = 3;
    const ratingStr = getVal(idx.rating);
    if (ratingStr) {
      const parsed = parseInt(ratingStr, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
        rating = parsed;
      } else {
        errors.push(`Row ${lineNum}: Invalid rating "${ratingStr}", using 3`);
      }
    }

    // Sentiment detection based on keywords + rating
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    if (rating >= 4) sentiment = "positive";
    else if (rating <= 2) sentiment = "negative";
    else {
      const lower = message.toLowerCase();
      const positiveWords = ["love", "great", "amazing", "fantastic", "phenomenal", "incredible", "best", "excellent", "perfect"];
      const negativeWords = ["crash", "broken", "terrible", "frustrating", "unreliable", "worst", "bad", "poor", "awful", "slow", "bug", "fix"];
      const posCount = positiveWords.filter((w) => lower.includes(w)).length;
      const negCount = negativeWords.filter((w) => lower.includes(w)).length;
      if (posCount > negCount) sentiment = "positive";
      else if (negCount > posCount) sentiment = "negative";
    }

    entries.push({ customerName, email, product, rating, sentiment, category, message });
  }

  return { entries, errors, total: entries.length };
}

// Simple CSV line parser (handles quoted fields)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// ─── Component ───
export default function BulkImport() {
  const bulkImport = useMutation(api.feedback.bulkImport);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ rows: string[][] } | null>(null);

  const reset = useCallback(() => {
    setResult(null);
    setFileName(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setResult({ imported: 0, skipped: 0, errors: ["Please upload a .csv file"] });
      return;
    }

    setFileName(file.name);
    setResult(null);

    const text = await file.text();
    const parsed = parseCSV(text);

    // Show preview (first 5 rows)
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const previewRows = lines.slice(0, 6).map((l) => parseCSVLine(l));
    setPreview({ rows: previewRows });

    if (parsed.entries.length === 0) {
      setResult({ imported: 0, skipped: 0, errors: parsed.errors.length > 0 ? parsed.errors : ["No valid entries found"] });
      return;
    }

    // Auto-import
    setImporting(true);
    try {
      const res = await bulkImport({ entries: parsed.entries });
      setResult({
        imported: res.imported,
        skipped: res.skipped,
        errors: parsed.errors,
      });
    } catch (err) {
      setResult({
        imported: 0,
        skipped: parsed.entries.length,
        errors: [`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`],
      });
    } finally {
      setImporting(false);
    }
  }, [bulkImport]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feedback-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-2xl p-6 glass-edge">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.55_0.12_265/0.08)]">
            <FileSpreadsheet className="size-4 text-[#4f6ef7]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground/80">
              Bulk CSV Import
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Upload a CSV file to import multiple feedback entries at once
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/40 bg-white/60 backdrop-blur-sm hover:bg-white/80"
          onClick={downloadTemplate}
        >
          <Download className="size-3.5" />
          Template
        </Button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative rounded-xl border-2 border-dashed transition-all duration-200 p-8 text-center cursor-pointer",
          dragOver
            ? "border-[#4f6ef7] bg-[oklch(0.55_0.12_265/0.04)]"
            : result
              ? result.imported > 0
                ? "border-[#3fb58b] bg-[oklch(0.55_0.14_150/0.03)]"
                : "border-[#e86a58] bg-[oklch(0.6_0.18_25/0.03)]"
              : "border-border/50 hover:border-[#4f6ef7]/40 hover:bg-[oklch(0.55_0.12_265/0.02)]",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {importing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-8 animate-spin text-[#4f6ef7]" />
            <p className="text-sm text-muted-foreground">Importing feedback entries...</p>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center gap-2">
            {result.imported > 0 ? (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-[oklch(0.55_0.14_150/0.1)]">
                  <CheckCircle2 className="size-6 text-[#3fb58b]" />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  Successfully imported {result.imported} entries
                </p>
                {result.skipped > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {result.skipped} entries skipped
                  </p>
                )}
                {result.errors.length > 0 && (
                  <div className="mt-2 max-h-32 overflow-y-auto w-full max-w-sm">
                    {result.errors.map((err, i) => (
                      <p key={i} className="text-[10px] text-[#e86a58] text-left">
                        ⚠ {err}
                      </p>
                    ))}
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 gap-1.5 border-white/40 bg-white/60"
                  onClick={reset}
                >
                  <RefreshCw className="size-3" />
                  Import Another
                </Button>
              </>
            ) : (
              <>
                <div className="flex size-12 items-center justify-center rounded-full bg-[oklch(0.6_0.18_25/0.1)]">
                  <AlertCircle className="size-6 text-[#e86a58]" />
                </div>
                <p className="text-sm font-semibold text-foreground">Import failed</p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-[#e86a58]">{err}</p>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 gap-1.5 border-white/40 bg-white/60"
                  onClick={reset}
                >
                  <RefreshCw className="size-3" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground/70">
              {fileName ? fileName : "Drop your CSV file here or click to browse"}
            </p>
            <p className="text-[10px] text-muted-foreground/40">
              CSV format: customerName, email, product, rating, category, message
            </p>
          </div>
        )}
      </div>

      {/* Preview table */}
      <AnimatePresence>
        {preview && !result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <p className="text-[10px] text-muted-foreground/50 mb-1.5">
              Preview ({fileName})
            </p>
            <div className="overflow-x-auto rounded-lg border border-border/30">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="bg-[oklch(0_0_0/0.02)]">
                    {preview.rows[0]?.map((h, i) => (
                      <th key={i} className="text-left font-medium text-muted-foreground/60 px-3 py-2 border-r border-border/20 last:border-r-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.slice(1, 4).map((row, ri) => (
                    <tr key={ri} className="border-t border-border/20">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-muted-foreground/70 truncate max-w-[120px] border-r border-border/20 last:border-r-0">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.rows.length > 4 && (
              <p className="text-[10px] text-muted-foreground/40 mt-1">
                ... and {preview.rows.length - 4} more rows
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV format info */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground/40">
        <span>Required: <code className="text-foreground/60 font-mono">customerName</code>, <code className="text-foreground/60 font-mono">message</code></span>
        <span>Optional: <code className="text-foreground/60 font-mono">email</code>, <code className="text-foreground/60 font-mono">product</code>, <code className="text-foreground/60 font-mono">rating</code> (1-5), <code className="text-foreground/60 font-mono">category</code></span>
      </div>
    </div>
  );
}
