import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";


type ScreenKey =
  | "high-roe-winners"
  | "value-picks"
  | "low-debt-stable"
  | "large-cap-quality"
  | "dividend-stocks";

interface ScreenDefinition {
  id: ScreenKey;
  name: string;
  description: string;
  tag: string;
  color: "default" | "secondary" | "outline" | "destructive";
  highlights: string[];
}

const SCREENS: ScreenDefinition[] = [
  {
    id: "high-roe-winners",
    name: "High ROE Winners",
    description: "Companies with strong profitability and manageable debt.",
    tag: "Quality",
    color: "default",
    highlights: ["ROE ≥ 20%", "Debt Ratio ≤ 0.5"],
  },
  {
    id: "value-picks",
    name: "Value Picks",
    description: "Undervalued stocks with good return on equity.",
    tag: "Value",
    color: "secondary",
    highlights: ["PE ≤ 15", "ROE ≥ 15%"],
  },
  {
    id: "low-debt-stable",
    name: "Low Debt, Stable",
    description: "Financially conservative companies with low leverage.",
    tag: "Safety",
    color: "outline",
    highlights: ["Debt Ratio ≤ 0.3"],
  },
  {
    id: "large-cap-quality",
    name: "Large Cap Quality",
    description: "Large companies with consistent returns on equity.",
    tag: "Large Cap",
    color: "default",
    highlights: ["Market Cap: Large", "ROE ≥ 18%"],
  },
  {
    id: "dividend-stocks",
    name: "Dividend Stocks",
    description: "Companies with attractive dividend yield.",
    tag: "Income",
    color: "outline",
    highlights: ["Dividend Yield ≥ 3%"],
  },
];

const Screens = () => {
  const navigate = useNavigate();

  const applyScreen = (id: ScreenKey) => {
    navigate(`/screener?screen=${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Smart Screens</h1>
          <p className="text-muted-foreground max-w-2xl">
            One-click strategies to filter the Indian market using fundamental signals.
            Select a screen to open the Screener with filters pre-applied.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SCREENS.map((screen) => (
            <Card key={screen.id} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{screen.name}</CardTitle>
                  <Badge variant={screen.color}>{screen.tag}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {screen.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {screen.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
                <Button className="w-full mt-2" onClick={() => applyScreen(screen.id)}>
                  Apply Screen
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Screens;
