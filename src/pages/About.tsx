import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, Target, Users } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About ArthaDrishti</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering retail investors with comprehensive fundamental analysis tools and real-time market insights.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-4">
              ArthaDrishti aims to democratize investment research by providing professional-grade tools and analytics 
              to retail investors. We believe that everyone should have access to the same quality of financial data 
              and insights that institutional investors use.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform combines real-time market data, fundamental analysis, and AI-powered insights to help you 
              make informed investment decisions.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Real-Time Data</h3>
              <p className="text-sm text-muted-foreground">
                Live stock prices and market updates from 68+ Indian companies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Risk Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced portfolio risk assessment and diversification tools
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Stock Screener</h3>
              <p className="text-sm text-muted-foreground">
                Filter stocks by P/E, market cap, ROE, debt ratio, and more
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
              <p className="text-sm text-muted-foreground">
                Built by investors, for investors with continuous improvements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team/Story Section */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-lg text-muted-foreground mb-4">
              ArthaDrishti was born from the frustration of trying to find reliable, comprehensive investment tools 
              that didn't require expensive subscriptions or institutional access. We started as a small team of 
              developers and investors who wanted to build something better.
            </p>
            <p className="text-lg text-muted-foreground">
              Today, we serve thousands of retail investors across India, providing them with the tools they need 
              to research stocks, analyze portfolios, and make data-driven investment decisions.
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default About;
