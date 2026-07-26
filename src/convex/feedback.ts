import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

const SAMPLE_FEEDBACK = [
  {
    customerName: "Alice Johnson",
    email: "alice@example.com",
    product: "Mobile App",
    rating: 5,
    sentiment: "positive" as const,
    category: "Praise",
    message: "Absolutely love the new redesign! The interface is so intuitive now, and the dark mode is gorgeous. Makes my daily workflow so much smoother.",
  },
  {
    customerName: "Bob Martinez",
    email: "bob@example.com",
    product: "Desktop App",
    rating: 2,
    sentiment: "negative" as const,
    category: "Complaint",
    message: "The desktop app keeps crashing when I try to export large files. This has been happening for weeks and it's really hurting my productivity.",
  },
  {
    customerName: "Carol Chen",
    email: "carol@example.com",
    product: "Mobile App",
    rating: 4,
    sentiment: "positive" as const,
    category: "Feature Request",
    message: "Great app overall! Would love to see integration with Notion and Google Calendar. That would make this perfect for my team.",
  },
  {
    customerName: "David Kim",
    email: "david@example.com",
    product: "Web Platform",
    rating: 1,
    sentiment: "negative" as const,
    category: "Complaint",
    message: "Load times are terrible since the last update. The dashboard takes over 10 seconds to load. Our team is considering switching to a competitor.",
  },
  {
    customerName: "Eva Williams",
    email: "eva@example.com",
    product: "Desktop App",
    rating: 3,
    sentiment: "neutral" as const,
    category: "General",
    message: "It works as expected but nothing special. The pricing seems a bit high for what it offers compared to similar tools on the market.",
  },
  {
    customerName: "Frank Thompson",
    email: "frank@example.com",
    product: "Mobile App",
    rating: 5,
    sentiment: "positive" as const,
    category: "Praise",
    message: "Customer support is phenomenal! Had an issue with billing and it was resolved within 15 minutes. This level of service is rare these days.",
  },
  {
    customerName: "Grace Lee",
    email: "grace@example.com",
    product: "Web Platform",
    rating: 2,
    sentiment: "negative" as const,
    category: "Bug Report",
    message: "Search functionality is broken. When I search for projects, it returns incorrect results or nothing at all. Very frustrating for daily use.",
  },
  {
    customerName: "Henry Davis",
    email: "henry@example.com",
    product: "Desktop App",
    rating: 4,
    sentiment: "positive" as const,
    category: "Feature Request",
    message: "The offline mode is fantastic. If you could add real-time collaborative editing like Google Docs, this would be unbeatable.",
  },
  {
    customerName: "Iris Garcia",
    email: "iris@example.com",
    product: "Web Platform",
    rating: 1,
    sentiment: "negative" as const,
    category: "Complaint",
    message: "Data sync is unreliable. Lost an hour of work yesterday because the auto-save didn't work. Can't trust the platform with important data.",
  },
  {
    customerName: "Jack Robinson",
    email: "jack@example.com",
    product: "Mobile App",
    rating: 4,
    sentiment: "positive" as const,
    category: "Praise",
    message: "The push notifications are incredibly well implemented. Timely, relevant, and not annoying like most apps. Great attention to detail!",
  },
  {
    customerName: "Karen Miller",
    email: "karen@example.com",
    product: "Web Platform",
    rating: 3,
    sentiment: "neutral" as const,
    category: "General",
    message: "It's okay overall. The onboarding was smooth but I feel like there's a learning curve for some advanced features. Documentation could be better.",
  },
  {
    customerName: "Leo Anderson",
    email: "leo@example.com",
    product: "Desktop App",
    rating: 5,
    sentiment: "positive" as const,
    category: "Praise",
    message: "Best investment our team made this year. The analytics dashboard gives us insights we never had before. ROI has been incredible.",
  },
  {
    customerName: "Mia Taylor",
    email: "mia@example.com",
    product: "Mobile App",
    rating: 2,
    sentiment: "negative" as const,
    category: "Bug Report",
    message: "The app crashes every time I try to upload images. Also, the camera feature doesn't work on my device (Pixel 8). Need a fix ASAP.",
  },
  {
    customerName: "Noah Wilson",
    email: "noah@example.com",
    product: "Desktop App",
    rating: 4,
    sentiment: "positive" as const,
    category: "Feature Request",
    message: "The batch processing feature saved us hours! Would love to see more automation options like scheduled exports and custom workflows.",
  },
  {
    customerName: "Olivia Brown",
    email: "olivia@example.com",
    product: "Web Platform",
    rating: 3,
    sentiment: "neutral" as const,
    category: "General",
    message: "The collaboration features work well but the notification settings are too granular. Having more preset options would simplify setup.",
  },
];

const PRODUCTS = ["Mobile App", "Desktop App", "Web Platform"] as const;
const CATEGORIES = ["Praise", "Complaint", "Bug Report", "Feature Request", "General"] as const;

// Analyze sentiment from message keywords (simple local analysis for demo)
function analyzeSentiment(message: string, rating: number): "positive" | "negative" | "neutral" {
  const positiveWords = ["love", "great", "amazing", "fantastic", "phenomenal", "incredible", "best", "wonderful", "excellent", "gorgeous", "smooth", "perfect", "phenomenal", "timely", "relevant", "unbeatable"];
  const negativeWords = ["crash", "broken", "terrible", "frustrating", "unreliable", "worst", "bad", "poor", "awful", "slow", "lost", "can't trust", "issues", "bug", "fix"];

  const lower = message.toLowerCase();
  let positiveCount = positiveWords.filter(w => lower.includes(w)).length;
  let negativeCount = negativeWords.filter(w => lower.includes(w)).length;

  // Use rating as stronger signal
  if (rating >= 4) positiveCount += 2;
  if (rating <= 2) negativeCount += 2;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

/** Seed the database with sample feedback data (idempotent). */
export const seed = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("feedback").first();
    if (existing) return { seeded: false, reason: "Feedback already exists" };

    const now = Date.now();
    for (let i = 0; i < SAMPLE_FEEDBACK.length; i++) {
      const fb = SAMPLE_FEEDBACK[i];
      await ctx.db.insert("feedback", {
        customerName: fb.customerName,
        email: fb.email,
        product: fb.product,
        rating: fb.rating,
        sentiment: fb.sentiment,
        category: fb.category,
        message: fb.message,
        createdAt: now - (SAMPLE_FEEDBACK.length - i) * 86400000, // spread over days
      });
    }
    return { seeded: true, count: SAMPLE_FEEDBACK.length };
  },
});

/** Get all feedback entries, newest first. */
export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("feedback")
      .order("desc")
      .collect();
  },
});

/** Submit a new feedback entry. */
export const submit = mutation({
  args: {
    customerName: v.string(),
    email: v.string(),
    product: v.union(v.literal("Mobile App"), v.literal("Desktop App"), v.literal("Web Platform")),
    rating: v.number(),
    category: v.union(v.literal("Praise"), v.literal("Complaint"), v.literal("Bug Report"), v.literal("Feature Request"), v.literal("General")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const sentiment = analyzeSentiment(args.message, args.rating);
    await ctx.db.insert("feedback", {
      ...args,
      sentiment,
      createdAt: Date.now(),
    });
  },
});

/** Get aggregated insights from feedback data. */
export const getInsights = query({
  handler: async (ctx) => {
    const allFeedback = await ctx.db.query("feedback").collect();
    const total = allFeedback.length;

    if (total === 0) return null;

    // Basic stats
    const avgRating = allFeedback.reduce((s, f) => s + f.rating, 0) / total;
    const positive = allFeedback.filter(f => f.sentiment === "positive").length;
    const negative = allFeedback.filter(f => f.sentiment === "negative").length;
    const neutral = allFeedback.filter(f => f.sentiment === "neutral").length;

    // By product
    const productStats = PRODUCTS.map(product => {
      const fb = allFeedback.filter(f => f.product === product);
      return {
        product,
        count: fb.length,
        avgRating: fb.length > 0 ? fb.reduce((s, f) => s + f.rating, 0) / fb.length : 0,
        positive: fb.filter(f => f.sentiment === "positive").length,
        negative: fb.filter(f => f.sentiment === "negative").length,
        neutral: fb.filter(f => f.sentiment === "neutral").length,
      };
    });

    // By category
    const categoryStats = CATEGORIES.map(category => {
      const fb = allFeedback.filter(f => f.category === category);
      return {
        category,
        count: fb.length,
        avgRating: fb.length > 0 ? fb.reduce((s, f) => s + f.rating, 0) / fb.length : 0,
      };
    });

    // Monthly trend (last 4 weeks)
    const now = Date.now();
    const fourWeeksAgo = now - 28 * 86400000;
    const weeklyBuckets: { label: string; count: number; positive: number; negative: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const weekStart = now - (3 - w) * 7 * 86400000;
      const weekEnd = weekStart + 7 * 86400000;
      const weekFb = allFeedback.filter(f => f.createdAt >= weekStart && f.createdAt < weekEnd);
      weeklyBuckets.push({
        label: `Week ${w + 1}`,
        count: weekFb.length,
        positive: weekFb.filter(f => f.sentiment === "positive").length,
        negative: weekFb.filter(f => f.sentiment === "negative").length,
      });
    }

    // Top complaints (negative feedback)
    const complaints = allFeedback
      .filter(f => f.sentiment === "negative")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(f => ({
        customerName: f.customerName,
        product: f.product,
        category: f.category,
        message: f.message,
        rating: f.rating,
        createdAt: f.createdAt,
      }));

    // Top positive feedback
    const praise = allFeedback
      .filter(f => f.sentiment === "positive")
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(f => ({
        customerName: f.customerName,
        product: f.product,
        category: f.category,
        message: f.message,
        rating: f.rating,
        createdAt: f.createdAt,
      }));

    return {
      total,
      avgRating: Math.round(avgRating * 10) / 10,
      positive,
      negative,
      neutral,
      positiveRate: Math.round((positive / total) * 100),
      negativeRate: Math.round((negative / total) * 100),
      productStats,
      categoryStats,
      weeklyTrend: weeklyBuckets,
      complaints,
      praise,
    };
  },
});
