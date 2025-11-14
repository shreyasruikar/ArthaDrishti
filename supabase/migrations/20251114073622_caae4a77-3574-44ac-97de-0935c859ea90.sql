-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create watchlist table
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  price_alert_threshold NUMERIC,
  last_notified_at TIMESTAMPTZ,
  UNIQUE(user_id, symbol)
);

-- Enable RLS on watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
  ON public.watchlist FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();