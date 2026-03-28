
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create scans table
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_co2 NUMERIC NOT NULL,
  grade TEXT NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" ON public.scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own scans" ON public.scans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create scan_items table
CREATE TABLE public.scan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  co2 NUMERIC NOT NULL
);

ALTER TABLE public.scan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scan items" ON public.scan_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_items.scan_id AND scans.user_id = auth.uid()));
CREATE POLICY "Users can insert their own scan items" ON public.scan_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.scans WHERE scans.id = scan_items.scan_id AND scans.user_id = auth.uid()));

-- Create swap_suggestions table
CREATE TABLE public.swap_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  original TEXT NOT NULL,
  swap TEXT NOT NULL,
  save_co2 NUMERIC NOT NULL
);

ALTER TABLE public.swap_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own swaps" ON public.swap_suggestions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.scans WHERE scans.id = swap_suggestions.scan_id AND scans.user_id = auth.uid()));
CREATE POLICY "Users can insert their own swaps" ON public.swap_suggestions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.scans WHERE scans.id = swap_suggestions.scan_id AND scans.user_id = auth.uid()));

-- Storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

CREATE POLICY "Users can upload receipts" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own receipts" ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
