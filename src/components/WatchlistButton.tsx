import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WatchlistButtonProps {
  symbol: string;
}

const WatchlistButton = ({ symbol }: WatchlistButtonProps) => {
  const { user } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkWatchlist();
    }
  }, [user, symbol]);

  const checkWatchlist = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("symbol", symbol.toUpperCase())
      .maybeSingle();

    if (!error && data) {
      setInWatchlist(true);
      setWatchlistId(data.id);
    } else {
      setInWatchlist(false);
      setWatchlistId(null);
    }
  };

  const toggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to use watchlist");
      return;
    }

    setLoading(true);
    try {
      if (inWatchlist && watchlistId) {
        // Remove from watchlist
        const { error } = await supabase
          .from("watchlist")
          .delete()
          .eq("id", watchlistId);

        if (error) throw error;
        
        setInWatchlist(false);
        setWatchlistId(null);
        toast.success("Removed from watchlist");
      } else {
        // Add to watchlist
        const { data, error } = await supabase
          .from("watchlist")
          .insert({
            user_id: user.id,
            symbol: symbol.toUpperCase()
          })
          .select()
          .single();

        if (error) throw error;
        
        setInWatchlist(true);
        setWatchlistId(data.id);
        toast.success("Added to watchlist");
      }
    } catch (err: any) {
      console.error("Error toggling watchlist:", err);
      if (err.code === '23505') {
        toast.error("Already in watchlist");
      } else {
        toast.error("Failed to update watchlist");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={inWatchlist ? "default" : "outline"}
      size="sm"
      onClick={toggleWatchlist}
      disabled={loading}
      className="gap-2"
    >
      <Star className={`h-4 w-4 ${inWatchlist ? 'fill-current' : ''}`} />
      {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
    </Button>
  );
};

export default WatchlistButton;
