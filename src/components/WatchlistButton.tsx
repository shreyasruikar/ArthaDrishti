import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface WatchlistButtonProps {
  symbol: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const WatchlistButton = ({ symbol, variant = "outline", size = "default" }: WatchlistButtonProps) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkWatchlist();
    }
  }, [user, symbol]);

  const checkWatchlist = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("symbol", symbol)
      .maybeSingle();

    setIsInWatchlist(!!data);
  };

  const handleToggle = async () => {
    if (!user) {
      toast.error("Please sign in to use watchlist");
      navigate("/auth");
      return;
    }

    setLoading(true);

    if (isInWatchlist) {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("symbol", symbol);

      if (error) {
        toast.error("Failed to remove from watchlist");
      } else {
        setIsInWatchlist(false);
        toast.success("Removed from watchlist");
      }
    } else {
      const { error } = await supabase
        .from("watchlist")
        .insert({
          user_id: user.id,
          symbol: symbol,
        });

      if (error) {
        toast.error("Failed to add to watchlist");
      } else {
        setIsInWatchlist(true);
        toast.success("Added to watchlist");
      }
    }

    setLoading(false);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
    >
      <Star className={`h-4 w-4 ${isInWatchlist ? "fill-current" : ""}`} />
      {size !== "icon" && (isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist")}
    </Button>
  );
};

export default WatchlistButton;
