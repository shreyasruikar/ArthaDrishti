import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Search, Scale, TrendingUp, Database, FileText } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Advanced Stock Screening",
    description: "Filter and screen stocks based on multiple parameters including financial ratios, market cap, and sector performance.",
  },
  {
    icon: BarChart3,
    title: "Comprehensive Metrics",
    description: "Access 50+ fundamental metrics including P/E, ROE, debt ratios, revenue growth, and profitability indicators.",
  },
  {
    icon: Scale,
    title: "Side-by-Side Comparison",
    description: "Compare multiple stocks simultaneously to make informed decisions based on relative performance and valuations.",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Track historical performance, growth trends, and financial health with intuitive visualizations and charts.",
  },
  {
    icon: Database,
    title: "Real-time Data",
    description: "Get up-to-date financial information synced directly from exchange filings and quarterly reports.",
  },
  {
    icon: FileText,
    title: "Detailed Reports",
    description: "Generate comprehensive analysis reports with key insights and recommendations for your portfolio.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Smart Investing
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful tools and features designed to help retail investors make data-driven decisions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
              >
                <CardContent className="p-6">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
