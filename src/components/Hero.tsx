import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-finance.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
      
      <div className="container relative mx-auto px-4 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <span className="text-sm font-medium text-accent">Data-Driven Insights</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Fundamental Stock Analysis
              <span className="block text-primary mt-2">Simplified</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Access comprehensive financial data, screen stocks with precision, and make informed investment decisions with ArthaDrishti's powerful analytics platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/screener">
                <Button size="lg" className="text-base group">
                  Start Screening
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base">
                View Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">5000+</div>
                <div className="text-sm text-muted-foreground">Listed Companies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">Key Metrics</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">Real-time</div>
                <div className="text-sm text-muted-foreground">Data Updates</div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-2xl opacity-50" />
            <img
              src={heroImage}
              alt="Financial data visualization"
              className="relative rounded-2xl shadow-2xl w-full"
            />
            
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-lg hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium">P/E Ratio</div>
                  <div className="text-xs text-muted-foreground">Industry Avg: 23.5</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
