import { motion, useScroll, useTransform } from "framer-motion";
import {
  BarChart3,
  Smile,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Star,
  MessageSquare,
  Zap,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useRef } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

function FeatureCard({
  icon: Icon,
  title,
  description,
  color = "oklch(0.55 0.12 265)",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color?: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      className="glass rounded-2xl p-6 glass-edge group hover:shadow-lg transition-all duration-300"
    >
      <div
        className="flex size-11 items-center justify-center rounded-xl mb-4 transition-colors duration-300 group-hover:scale-105"
        style={{ backgroundColor: `${color}0.12)` }}
      >
        <Icon className="size-5" style={{ color }} />
      </div>
      <h3 className="text-sm font-semibold text-foreground/90 mb-2">
        {title}
      </h3>
      <p className="text-xs leading-relaxed text-muted-foreground/70">
        {description}
      </p>
    </motion.div>
  );
}

function StatNumber({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center p-4">
      <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground/60 mt-1.5">{label}</p>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-glass-gradient bg-glass-radial overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 size-[300px] rounded-full bg-gradient-to-br from-[oklch(0.6_0.12_200/0.1)] to-transparent blur-3xl" />
        <div className="absolute top-40 right-10 size-[350px] rounded-full bg-gradient-to-br from-[oklch(0.5_0.16_265/0.08)] to-transparent blur-3xl" />
        <div className="absolute bottom-40 left-1/3 size-[250px] rounded-full bg-gradient-to-tr from-[oklch(0.55_0.14_150/0.06)] to-transparent blur-3xl" />
      </div>

      {/* ──── Navigation ──── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-5 py-4 max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[oklch(0.55_0.12_265/0.1)]">
            <BarChart3 className="size-4.5 text-[#4f6ef7]" />
          </div>
          <span className="text-sm font-bold text-foreground">
            Feedback<span className="text-[#4f6ef7]">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
          <Button
            size="sm"
            className="text-xs bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white shadow-lg shadow-[oklch(0.55_0.12_265/0.2)]"
            onClick={() => navigate("/auth")}
          >
            Get Started
            <ArrowRight className="size-3.5 ml-1" />
          </Button>
        </div>
      </motion.nav>

      {/* ──── Hero Section ──── */}
      <section ref={heroRef} className="relative z-10 px-5 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-subtle text-xs text-muted-foreground mb-6">
              <Zap className="size-3 text-[#4f6ef7]" />
              Intelligent feedback analysis powered by AI
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            Understand your customers{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f6ef7] via-[#5bc0de] to-[#4fc4a8]">
              at a glance
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-5 text-sm sm:text-base text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed"
          >
            Transform raw customer feedback into actionable insights with
            real-time sentiment analysis, visual trends, and intelligent
            categorization. Make data-driven decisions that delight your users.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <Button
              size="lg"
              className="bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white text-sm shadow-xl shadow-[oklch(0.55_0.12_265/0.25)] px-6"
              onClick={() => navigate("/auth")}
            >
              Start Analyzing Free
              <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-sm glass border-white/40 hover:bg-white/60 px-6"
              onClick={() => navigate("/auth")}
            >
              View Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 glass rounded-2xl py-4 px-6 glass-edge max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-3 divide-x divide-border/40">
              <StatNumber value="10K+" label="Feedback Analyzed" />
              <StatNumber value="98%" label="Accuracy Rate" />
              <StatNumber value="5min" label="Setup Time" />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ──── Features Section ──── */}
      <section className="relative z-10 px-5 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Everything you need to understand feedback
            </h2>
            <p className="text-sm text-muted-foreground/70 mt-3 max-w-xl mx-auto">
              From sentiment breakdown to trend analysis — get the full picture
              of what your customers are saying.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={BarChart3}
              title="Visual Analytics"
              description="Beautiful bar charts and trend lines that show feedback volume, distribution, and patterns across products and time periods."
              color="#4f6ef7"
            />
            <FeatureCard
              icon={Smile}
              title="Sentiment Analysis"
              description="Automatically detect positive, negative, and neutral sentiment from customer messages with high accuracy."
              color="#3fb58b"
            />
            <FeatureCard
              icon={Lightbulb}
              title="Smart Insights"
              description="Surface top complaints, praise, and feature requests. Know what to fix and what to amplify — instantly."
              color="#5bc0de"
            />
            <FeatureCard
              icon={AlertTriangle}
              title="Complaint Tracking"
              description="Monitor negative feedback in real-time. Get alerted when issues spike so you can respond before they escalate."
              color="#e86a58"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Trend Analysis"
              description="Track sentiment and feedback volume over weeks. Spot improvements or regressions in customer satisfaction."
              color="#9b6ef3"
            />
            <FeatureCard
              icon={Users}
              title="Customer Segmentation"
              description="Understand feedback by product, category, and customer type. Target your improvements where they matter most."
              color="#4fc4a8"
            />
          </div>
        </motion.div>
      </section>

      {/* ──── How It Works ──── */}
      <section className="relative z-10 px-5 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              How it works
            </h2>
            <p className="text-sm text-muted-foreground/70 mt-3 max-w-xl mx-auto">
              Get from customer feedback to actionable insights in three simple
              steps.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: MessageSquare,
                title: "Collect Feedback",
                description:
                  "Import feedback from surveys, support tickets, reviews, or direct submissions into the platform.",
                color: "#4f6ef7",
              },
              {
                step: "02",
                icon: Smile,
                title: "Analyze Sentiment",
                description:
                  "Our AI analyzes each message for sentiment, detects the category, and assigns a product tag automatically.",
                color: "#3fb58b",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Get Insights",
                description:
                  "View aggregated insights, trends, and highlighted complaints or praise in a beautiful dashboard.",
                color: "#9b6ef3",
              },
            ].map((step) => (
              <motion.div
                key={step.step}
                variants={scaleIn}
                className="glass rounded-2xl p-6 glass-edge text-center relative"
              >
                <div className="flex justify-center mb-2">
                  <span
                    className="flex size-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.step}
                  </span>
                </div>
                <div
                  className="flex size-10 items-center justify-center rounded-xl mx-auto mb-4"
                  style={{ backgroundColor: `${step.color}0.12)` }}
                >
                  <step.icon className="size-5" style={{ color: step.color }} />
                </div>
                <h3 className="text-sm font-semibold text-foreground/90 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground/70">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ──── Testimonial ──── */}
      <section className="relative z-10 px-5 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} className="glass rounded-2xl p-8 glass-edge text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="size-4 fill-[#3fb58b] text-[#3fb58b]"
                />
              ))}
            </div>
            <blockquote className="text-sm sm:text-base text-foreground/80 leading-relaxed italic">
              "This completely transformed how our product team prioritizes
              improvements. We went from guessing what users wanted to having
              clear, data-backed decisions. Our satisfaction scores improved
              by 40% in two months."
            </blockquote>
            <div className="mt-5 flex items-center justify-center gap-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-[#4f6ef7] to-[#5bc0de] flex items-center justify-center text-white text-xs font-bold">
                SK
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground/80">
                  Sarah Kim
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  VP of Product, ScaleUp Inc.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ──── CTA Section ──── */}
      <section className="relative z-10 px-5 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="glass-strong rounded-3xl p-10 glass-edge">
            <div className="flex justify-center mb-5">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f6ef7] to-[#5bc0de] shadow-xl shadow-[oklch(0.55_0.12_265/0.2)]">
                <BarChart3 className="size-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Ready to understand your customers?
            </h2>
            <p className="text-sm text-muted-foreground/70 mb-7 max-w-md mx-auto">
              Start analyzing feedback in minutes. No credit card required.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-[#4f6ef7] hover:bg-[#3d5ce5] text-white text-sm shadow-xl shadow-[oklch(0.55_0.12_265/0.25)] px-6"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="relative z-10 px-5 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-2xl px-6 py-5 glass-edge">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[oklch(0.55_0.12_265/0.1)]">
                  <BarChart3 className="size-3 text-[#4f6ef7]" />
                </div>
                <span className="text-xs font-semibold text-foreground/70">
                  FeedbackAI
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground/40">
                Built with Freebuff
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
