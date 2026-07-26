import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ───
const COLORS = {
  positive: "#3fb58b",
  negative: "#e86a58",
  neutral: "#8b95b0",
  primary: "#4f6ef7",
};

function formatDateFull(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getSentimentEmoji(s: string) {
  if (s === "positive") return "😊";
  if (s === "negative") return "😟";
  return "😐";
}

function getCategoryIcon(cat: string) {
  if (cat === "Praise" || cat === "Complaint") return "📌";
  if (cat === "Bug Report") return "🐛";
  if (cat === "Feature Request") return "💡";
  return "💬";
}

// ─── Generate the full HTML report content ───
function generateReportHTML(insights: NonNullable<ReturnType<typeof useQuery<typeof api.feedback.getInsights>>>) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build product comparison rows
  const productRows = insights.productStats
    .map(
      (p) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;font-weight:500;">${p.product}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;text-align:center;">${p.count}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;text-align:center;">${p.avgRating.toFixed(1)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;text-align:center;color:#3fb58b;font-weight:600;">${p.positive}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;text-align:center;color:#e86a58;font-weight:600;">${p.negative}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef0f4;text-align:center;color:#8b95b0;">${p.neutral}</td>
    </tr>`,
    )
    .join("");

  // Build complaints list
  const complaintItems = insights.complaints
    .map(
      (c) => `
    <div style="margin-bottom:14px;padding:14px 16px;background:#fdf6f5;border-left:3px solid #e86a58;border-radius:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:600;font-size:13px;color:#1a1a2e;">${c.customerName}</span>
        <span style="font-size:11px;color:#8b95b0;">${formatDateFull(c.createdAt)}</span>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">
        <span style="background:#fce8e6;color:#e86a58;padding:2px 8px;border-radius:4px;font-size:10px;">${c.product}</span>
        <span style="background:#f0f2f5;color:#6b7280;padding:2px 8px;border-radius:4px;font-size:10px;margin-left:6px;">${c.category}</span>
      </div>
      <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;font-style:italic;">"${c.message}"</p>
    </div>`,
    )
    .join("");

  // Build praise list
  const praiseItems = insights.praise
    .map(
      (p) => `
    <div style="margin-bottom:14px;padding:14px 16px;background:#f0faf5;border-left:3px solid #3fb58b;border-radius:8px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-weight:600;font-size:13px;color:#1a1a2e;">${p.customerName}</span>
        <span style="font-size:11px;color:#8b95b0;">${formatDateFull(p.createdAt)}</span>
      </div>
      <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">
        <span style="background:#e6f7ef;color:#3fb58b;padding:2px 8px;border-radius:4px;font-size:10px;">${p.product}</span>
        <span style="background:#f0f2f5;color:#6b7280;padding:2px 8px;border-radius:4px;font-size:10px;margin-left:6px;">${p.category}</span>
      </div>
      <p style="font-size:13px;color:#374151;line-height:1.6;margin:0;font-style:italic;">"${p.message}"</p>
    </div>`,
    )
    .join("");

  // Category breakdown rows
  const categoryRows = insights.categoryStats
    .filter((c) => c.count > 0)
    .map(
      (c) => `
    <tr>
      <td style="padding:8px 14px;border-bottom:1px solid #eef0f4;">${getCategoryIcon(c.category)} ${c.category}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eef0f4;text-align:center;font-weight:600;">${c.count}</td>
      <td style="padding:8px 14px;border-bottom:1px solid #eef0f4;text-align:center;">${c.avgRating.toFixed(1)} ⭐</td>
    </tr>`,
    )
    .join("");

  // Recommendations
  const recommendations: string[] = [];
  if (insights.negativeRate > 30) {
    recommendations.push("🔴 **Critical:** Negative feedback rate is high (${insights.negativeRate}%). Investigate top complaint areas immediately.");
  }
  if (insights.avgRating < 3) {
    recommendations.push("🟡 **Attention:** Average rating is below 3.0. Focus on addressing core product issues.");
  }
  const topComplaintProduct = insights.productStats.sort((a, b) => b.negative - a.negative)[0];
  if (topComplaintProduct && topComplaintProduct.negative > 0) {
    recommendations.push(`🔍 **Focus Area:** "${topComplaintProduct.product}" has the most negative feedback (${topComplaintProduct.negative}). Prioritize improvements here.`);
  }
  const topPraisedProduct = insights.productStats.sort((a, b) => b.positive - a.positive)[0];
  if (topPraisedProduct && topPraisedProduct.positive > 0) {
    recommendations.push(`✅ **Strength:** "${topPraisedProduct.product}" has the most positive feedback (${topPraisedProduct.positive}). Identify what's working and replicate it.`);
  }
  recommendations.push("📊 **Monitor:** Track weekly sentiment trends to measure the impact of improvements over time.");
  recommendations.push("💬 **Engage:** Follow up with customers who left negative feedback to show you care and gather more details.");

  const recItems = recommendations
    .map((r) => `<li style="margin-bottom:10px;line-height:1.5;font-size:13px;">${r}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Insights Report - ${dateStr}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fb;
      color: #1a1a2e;
      padding: 40px 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, #4f6ef7, #5bc0de);
      color: white;
      border-radius: 16px;
      padding: 36px 40px;
      margin-bottom: 24px;
    }
    .header h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.85; }
    .header .date { font-size: 12px; opacity: 0.7; margin-top: 8px; }
    .section {
      background: white;
      border-radius: 12px;
      padding: 28px 32px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
    }
    .section h2 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eef0f4;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #f8f9fc;
      border-radius: 10px;
      padding: 16px;
      text-align: center;
    }
    .stat-card .value { font-size: 24px; font-weight: 700; color: #1a1a2e; }
    .stat-card .label { font-size: 11px; color: #8b95b0; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { padding: 10px 14px; text-align: left; border-bottom: 2px solid #eef0f4; color: #8b95b0; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 14px; border-bottom: 1px solid #eef0f4; font-size: 13px; }
    .sentiment-bar {
      display: flex; height: 10px; border-radius: 5px; overflow: hidden; margin: 12px 0;
    }
    .sentiment-bar .segment { transition: width 0.3s; }
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;
    }
    .badge-green { background: #e6f7ef; color: #3fb58b; }
    .badge-red { background: #fce8e6; color: #e86a58; }
    .badge-gray { background: #f0f2f5; color: #6b7280; }
    .footer { text-align: center; font-size: 11px; color: #8b95b0; padding: 20px; }
    @media print {
      body { background: white; padding: 0; }
      .header { border-radius: 0; }
      .section { box-shadow: none; border: 1px solid #eef0f4; }
    }
  </style>
</head>
<body>
  <div class="container">

    <!-- Header -->
    <div class="header">
      <h1>📊 Feedback Insights Report</h1>
      <p>Smart Customer Feedback Analysis — Executive Summary</p>
      <div class="date">Generated on ${dateStr}</div>
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <h2>Executive Summary</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${insights.total}</div>
          <div class="label">Total Feedback</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color:#4f6ef7;">${insights.avgRating}</div>
          <div class="label">Avg Rating</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color:#3fb58b;">${insights.positiveRate}%</div>
          <div class="label">Positive Rate</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color:#e86a58;">${insights.negative}%</div>
          <div class="label">Negative Count</div>
        </div>
      </div>
      <p style="font-size:13px;color:#6b7280;line-height:1.6;">
        This report analyzes <strong>${insights.total}</strong> customer feedback entries across <strong>${insights.productStats.filter(p => p.count > 0).length}</strong> products.
        The overall average rating is <strong>${insights.avgRating}/5.0</strong> with a <strong>${insights.positiveRate}%</strong> positive sentiment rate.
      </p>
    </div>

    <!-- Sentiment Breakdown -->
    <div class="section">
      <h2>Sentiment Breakdown</h2>
      <div class="sentiment-bar">
        <div class="segment" style="width:${insights.positiveRate}%;background:#3fb58b;"></div>
        <div class="segment" style="width:${insights.neutral > 0 ? Math.round(insights.neutral / insights.total * 100) : 0}%;background:#8b95b0;"></div>
        <div class="segment" style="width:${insights.negativeRate}%;background:#e86a58;"></div>
      </div>
      <div style="display:flex;gap:16px;font-size:13px;margin-top:8px;">
        <span><span style="color:#3fb58b;font-weight:600;">${insights.positive}</span> Positive (${insights.positiveRate}%)</span>
        <span><span style="color:#8b95b0;font-weight:600;">${insights.neutral}</span> Neutral</span>
        <span><span style="color:#e86a58;font-weight:600;">${insights.negative}</span> Negative (${insights.negativeRate}%)</span>
      </div>
    </div>

    <!-- Product Comparison -->
    <div class="section">
      <h2>📱 Product Comparison</h2>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align:center;">Count</th>
            <th style="text-align:center;">Avg Rating</th>
            <th style="text-align:center;color:#3fb58b;">👍 Positive</th>
            <th style="text-align:center;color:#e86a58;">👎 Negative</th>
            <th style="text-align:center;">😐 Neutral</th>
          </tr>
        </thead>
        <tbody>
          ${productRows}
        </tbody>
      </table>
    </div>

    <!-- Category Breakdown -->
    <div class="section">
      <h2>📂 Feedback Categories</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th style="text-align:center;">Count</th>
            <th style="text-align:center;">Avg Rating</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows}
        </tbody>
      </table>
    </div>

    <!-- Recent Complaints -->
    <div class="section">
      <h2>🚨 Top Issues & Complaints</h2>
      ${complaintItems || '<p style="color:#8b95b0;font-style:italic;">No complaints found — everything looks great!</p>'}
    </div>

    <!-- Positive Feedback -->
    <div class="section">
      <h2>🌟 Top Praise & Positive Feedback</h2>
      ${praiseItems || '<p style="color:#8b95b0;font-style:italic;">No positive feedback yet.</p>'}
    </div>

    <!-- Recommendations -->
    <div class="section">
      <h2>💡 Recommendations</h2>
      <ol style="padding-left:20px;">
        ${recItems}
      </ol>
    </div>

    <!-- Weekly Trend Data -->
    <div class="section">
      <h2>📈 Weekly Trend Data</h2>
      <table>
        <thead>
          <tr>
            <th>Week</th>
            <th style="text-align:center;">Total</th>
            <th style="text-align:center;color:#3fb58b;">Positive</th>
            <th style="text-align:center;color:#e86a58;">Negative</th>
          </tr>
        </thead>
        <tbody>
          ${insights.weeklyTrend.map(w => `
          <tr>
            <td style="padding:8px 14px;border-bottom:1px solid #eef0f4;">${w.label}</td>
            <td style="padding:8px 14px;border-bottom:1px solid #eef0f4;text-align:center;">${w.count}</td>
            <td style="padding:8px 14px;border-bottom:1px solid #eef0f4;text-align:center;color:#3fb58b;">${w.positive}</td>
            <td style="padding:8px 14px;border-bottom:1px solid #eef0f4;text-align:center;color:#e86a58;">${w.negative}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Generated by FeedbackAI — Smart Feedback Customer Analyzer<br>
      Built with Freebuff
    </div>

  </div>
</body>
</html>`;
}

// ─── Component ───
export default function FeedbackReport() {
  const insights = useQuery(api.feedback.getInsights);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    if (!insights) return;
    setGenerating(true);

    const html = generateReportHTML(insights);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-report-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setGenerating(false);
  };

  return (
    <div className="glass rounded-2xl p-6 glass-edge">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.55_0.12_265/0.08)]">
            <FileText className="size-4 text-[#4f6ef7]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground/80">
              Written Insights Report
            </h3>
            <p className="text-xs text-muted-foreground/60">
              Generate a comprehensive HTML report with all insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {copied && (
            <span className="text-xs text-[#3fb58b] flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              Copied
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/40 bg-white/60 backdrop-blur-sm hover:bg-white/80"
            onClick={() => {
              if (!insights) return;
              const html = generateReportHTML(insights);
              navigator.clipboard.writeText(html).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
            disabled={!insights}
          >
            <FileText className="size-3.5" />
            Copy HTML
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white"
            onClick={handleDownload}
            disabled={!insights || generating}
          >
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Download Report
          </Button>
        </div>
      </div>

      {/* Preview of what's included */}
      {insights && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <div className="bg-[oklch(0.55_0.12_265/0.04)] rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{insights.total}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Feedback Entries</p>
          </div>
          <div className="bg-[oklch(0.55_0.14_150/0.04)] rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#3fb58b]">{insights.positive}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Positive</p>
          </div>
          <div className="bg-[oklch(0.6_0.18_25/0.04)] rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-[#e86a58]">{insights.negative}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Negative</p>
          </div>
          <div className="bg-[oklch(0.65_0.06_260/0.04)] rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-foreground">{insights.complaints.length + insights.praise.length}</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Key Items</p>
          </div>
        </div>
      )}
    </div>
  );
}
