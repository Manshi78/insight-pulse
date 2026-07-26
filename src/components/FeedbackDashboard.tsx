import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from "recharts";
import {
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Star,
  Lightbulb,
  AlertTriangle,
  ThumbsUp,
  Smile,
  Frown,
  Meh,
  RefreshCw,
  BarChart3,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FeedbackReport from "@/components/FeedbackReport";
import BulkImport from "@/components/BulkImport";

// ─── Container variants for staggered animations ───
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

// ─── Chart Colors (cool palette) ───
const COLORS = {
  primary: "#4f6ef7",
  positive: "#3fb58b",
  negative: "#e86a58",
  neutral: "#8b95b0",
  chart1: "#4f6ef7",
  chart2: "#5bc0de",
  chart3: "#9b6ef3",
  chart4: "#4fc4a8",
  chart5: "#8bd46a",
};

// ─── Helper: format date ───
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Helper: time ago ───
function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

// ─── Stat Card ───
function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <motion.div
      variants={item}
      className="glass rounded-2xl p-5 relative glass-edge overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground/70 uppercase">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {sublabel && (
            <p className="text-xs text-muted-foreground/70">{sublabel}</p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl shrink-0",
            trend === "up" && "bg-sentiment-positive text-[#3fb58b]",
            trend === "down" && "bg-sentiment-negative text-[#e86a58]",
            (!trend || trend === "neutral") &&
              "bg-[oklch(0.55_0.12_265/0.1)] text-[#4f6ef7]"
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend === "up" && (
            <TrendingUp className="size-3.5 text-[#3fb58b]" />
          )}
          {trend === "down" && (
            <TrendingDown className="size-3.5 text-[#e86a58]" />
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Glass Card wrapper ───
function GlassCard({
  children,
  className,
  title,
  icon: Icon,
  action,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      variants={item}
      style={style}
      className={cn(
        "glass rounded-2xl overflow-hidden glass-edge",
        className
      )}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.12_265/0.08)]">
                <Icon className="size-3.5 text-[#4f6ef7]" />
              </div>
            )}
            {title && (
              <h3 className="text-sm font-semibold text-foreground/80">
                {title}
              </h3>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="px-6 pb-5">{children}</div>
    </motion.div>
  );
}

// ─── Custom Tooltip for charts ───
function ChartTooltipCard({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-3.5 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-foreground/80 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="size-2 rounded-sm shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───
export default function FeedbackDashboard() {
  const insights = useQuery(api.feedback.getInsights);
  const allFeedback = useQuery(api.feedback.listAll);
  const seed = useMutation(api.feedback.seed);

  // Auto-seed on first load if no data
  useEffect(() => {
    if (insights === null && allFeedback !== undefined) {
      seed();
    }
  }, [insights, allFeedback, seed]);

  // Loading state
  if (!insights || !allFeedback) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-5 animate-spin" />
          <span className="text-sm">Loading feedback data...</span>
        </div>
      </div>
    );
  }

  // ── Prepare chart data ──
  const barData = insights.productStats.map((p) => ({
    name: p.product,
    Positive: p.positive,
    Negative: p.negative,
    Neutral: p.neutral,
  }));

  const sentimentPie = [
    { name: "Positive", value: insights.positive, color: COLORS.positive },
    { name: "Negative", value: insights.negative, color: COLORS.negative },
    { name: "Neutral", value: insights.neutral, color: COLORS.neutral },
  ];

  const trendData = insights.weeklyTrend.map((w) => ({
    week: w.label,
    Feedback: w.count,
    Positive: w.positive,
    Negative: w.negative,
  }));

  const categoryBarData = insights.categoryStats
    .filter((c) => c.count > 0)
    .map((c) => ({
      name: c.category,
      Count: c.count,
      "Avg Rating": Math.round(c.avgRating * 10) / 10,
    }));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ────────────── Header ────────────── */}
      <motion.div variants={item} className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Smart Feedback Analyzer
        </h1>
        <p className="text-sm text-muted-foreground/70">
          Real-time customer sentiment analysis and actionable insights across
          all products
        </p>
      </motion.div>

      {/* ────────────── Stats Grid ────────────── */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={MessageSquare}
          label="Total Feedback"
          value={insights.total}
          sublabel="Across all products"
          trend="up"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={insights.avgRating}
          sublabel={`${insights.positive} positive · ${insights.negative} negative`}
          trend={insights.avgRating >= 3.5 ? "up" : "down"}
        />
        <StatCard
          icon={Smile}
          label="Positive Rate"
          value={`${insights.positiveRate}%`}
          sublabel={`${insights.positive} of ${insights.total} feedback`}
          trend={insights.positiveRate >= 50 ? "up" : "down"}
        />
        <StatCard
          icon={Frown}
          label="Negative Rate"
          value={`${insights.negativeRate}%`}
          sublabel={`${insights.negative} of ${insights.total} feedback`}
          trend={insights.negativeRate > 30 ? "down" : "up"}
        />
      </motion.div>

      {/* ────────────── Charts Row ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart by product */}
        <GlassCard
          title="Feedback by Product"
          icon={BarChart3}
        >
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={barData}
                barSize={28}
                barGap={4}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0 0 0 / 0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<ChartTooltipCard />}
                  cursor={{
                    fill: "oklch(0.55 0.12 265 / 0.05)",
                    radius: 6,
                  }}
                />
                <Bar
                  dataKey="Positive"
                  stackId="a"
                  fill={COLORS.positive}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="Neutral"
                  stackId="a"
                  fill={COLORS.neutral}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="Negative"
                  stackId="a"
                  fill={COLORS.negative}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-5 mt-2 text-xs text-muted-foreground/70">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#3fb58b]" />
                Positive
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#8b95b0]" />
                Neutral
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm bg-[#e86a58]" />
                Negative
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Sentiment pie chart */}
        <GlassCard
          title="Sentiment Distribution"
          icon={Smile}
        >
          <div className="flex items-center justify-center mt-1">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sentimentPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltipCard />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs">
            {sentimentPie.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-muted-foreground">{s.name}</span>
                <span className="font-semibold text-foreground">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ────────────── Trend + Categories ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly trend */}
        <GlassCard
          title="Weekly Feedback Trend"
          icon={Timer}
        >
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart
                data={trendData}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0 0 0 / 0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltipCard />} />
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={COLORS.chart1}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={COLORS.chart1}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="Feedback"
                  stroke={COLORS.chart1}
                  strokeWidth={2}
                  fill="url(#trendGrad)"
                  dot={{ r: 3, fill: COLORS.chart1, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Category breakdown */}
        <GlassCard
          title="Feedback by Category"
          icon={Lightbulb}
        >
          <div className="mt-2">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={categoryBarData}
                barSize={28}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0 0 0 / 0.06)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.03 260)" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />
                <Tooltip content={<ChartTooltipCard />} />
                <Bar
                  dataKey="Count"
                  radius={[0, 4, 4, 0]}
                >
                  {categoryBarData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        [
                          COLORS.chart1,
                          COLORS.chart2,
                          COLORS.chart3,
                          COLORS.chart4,
                          COLORS.chart5,
                        ][i % 5]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* ────────────── Insights: Complaints + Praise ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints */}
        <GlassCard
          title="Recent Complaints & Issues"
          icon={AlertTriangle}
          className="border-l-[3px]"
          style={{ borderLeftColor: COLORS.negative }}
        >
          <div className="space-y-3 mt-1">
            {insights.complaints.length === 0 && (
              <p className="text-sm text-muted-foreground/60 py-4 text-center">
                No complaints found — everything looks great!
              </p>
            )}
            {insights.complaints.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-[oklch(0.6_0.18_25/0.04)] border border-[oklch(0.6_0.18_25/0.08)] p-3.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-foreground/80 truncate">
                      {c.customerName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[oklch(0.6_0.18_25/0.08)] text-[#e86a58] font-medium shrink-0">
                      {c.product}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[oklch(0.5_0.03_260/0.06)] text-muted-foreground shrink-0">
                      {c.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
                  "{c.message}"
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-2.5",
                        s < c.rating
                          ? "fill-[#e86a58] text-[#e86a58]"
                          : "fill-none text-[oklch(0_0_0/0.08)]"
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Positive Feedback */}
        <GlassCard
          title="Positive Feedback & Praise"
          icon={ThumbsUp}
          className="border-l-[3px]"
          style={{ borderLeftColor: COLORS.positive }}
        >
          <div className="space-y-3 mt-1">
            {insights.praise.length === 0 && (
              <p className="text-sm text-muted-foreground/60 py-4 text-center">
                No positive feedback yet.
              </p>
            )}
            {insights.praise.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-[oklch(0.55_0.14_150/0.04)] border border-[oklch(0.55_0.14_150/0.08)] p-3.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-foreground/80 truncate">
                      {p.customerName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[oklch(0.55_0.14_150/0.1)] text-[#3fb58b] font-medium shrink-0">
                      {p.product}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[oklch(0.5_0.03_260/0.06)] text-muted-foreground shrink-0">
                      {p.category}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 shrink-0">
                    {timeAgo(p.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2">
                  "{p.message}"
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-2.5",
                        s < p.rating
                          ? "fill-[#3fb58b] text-[#3fb58b]"
                          : "fill-none text-[oklch(0_0_0/0.08)]"
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* ────────────── Actions: Report + Bulk Import ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeedbackReport />
        <BulkImport />
      </div>

      {/* ────────────── Recent Feedback Table ────────────── */}
      <GlassCard
        title="Recent Feedback Entries"
        icon={MessageSquare}
      >
        <div className="overflow-x-auto mt-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left font-medium text-muted-foreground/60 py-2.5 pr-3">
                  Customer
                </th>
                <th className="text-left font-medium text-muted-foreground/60 py-2.5 pr-3">
                  Product
                </th>
                <th className="text-left font-medium text-muted-foreground/60 py-2.5 pr-3">
                  Sentiment
                </th>
                <th className="text-left font-medium text-muted-foreground/60 py-2.5 pr-3 max-w-[260px]">
                  Message
                </th>
                <th className="text-right font-medium text-muted-foreground/60 py-2.5">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {allFeedback.slice(0, 8).map((fb, i) => (
                <motion.tr
                  key={fb._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border/20 last:border-b-0 hover:bg-[oklch(0_0_0/0.02)] transition-colors"
                >
                  <td className="py-3 pr-3">
                    <div>
                      <span className="font-medium text-foreground/80">
                        {fb.customerName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">
                    {fb.product}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                        fb.sentiment === "positive" &&
                          "bg-sentiment-positive text-[#3fb58b]",
                        fb.sentiment === "negative" &&
                          "bg-sentiment-negative text-[#e86a58]",
                        fb.sentiment === "neutral" &&
                          "bg-sentiment-neutral text-[#8b95b0]"
                      )}
                    >
                      {fb.sentiment === "positive" && (
                        <Smile className="size-3" />
                      )}
                      {fb.sentiment === "negative" && (
                        <Frown className="size-3" />
                      )}
                      {fb.sentiment === "neutral" && (
                        <Meh className="size-3" />
                      )}
                      {fb.sentiment}
                    </span>
                  </td>
                  <td className="py-3 pr-3 max-w-[260px]">
                    <p className="truncate text-muted-foreground/70">
                      {fb.message}
                    </p>
                  </td>
                  <td className="py-3 text-right text-muted-foreground/60">
                    {formatDate(fb.createdAt)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}
