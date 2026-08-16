-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  active_background_id UUID,
  outdoor_weather TEXT NOT NULL DEFAULT 'rain',
  show_clock BOOLEAN NOT NULL DEFAULT true,
  show_stopwatch BOOLEAN NOT NULL DEFAULT false,
  lights_on BOOLEAN NOT NULL DEFAULT true,
  master_volume NUMERIC NOT NULL DEFAULT 0.6,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- BACKGROUNDS
CREATE TABLE public.backgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  preview_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'video',
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backgrounds TO authenticated;
GRANT SELECT ON public.backgrounds TO anon;
GRANT ALL ON public.backgrounds TO service_role;
ALTER TABLE public.backgrounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "backgrounds_read_shared" ON public.backgrounds FOR SELECT USING (is_shared = true);
CREATE POLICY "backgrounds_read_own" ON public.backgrounds FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "backgrounds_insert_own" ON public.backgrounds FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "backgrounds_update_own" ON public.backgrounds FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "backgrounds_delete_own" ON public.backgrounds FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- PLAYLISTS
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "playlists_own" ON public.playlists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- TRACKS
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  playlist_id UUID REFERENCES public.playlists ON DELETE SET NULL,
  title TEXT NOT NULL,
  artist TEXT,
  file_path TEXT NOT NULL,
  duration_seconds INTEGER,
  category TEXT NOT NULL DEFAULT 'user',
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracks TO authenticated;
GRANT SELECT ON public.tracks TO anon;
GRANT ALL ON public.tracks TO service_role;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tracks_read_shared" ON public.tracks FOR SELECT USING (is_shared = true);
CREATE POLICY "tracks_read_own" ON public.tracks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "tracks_insert_own" ON public.tracks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tracks_update_own" ON public.tracks FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tracks_delete_own" ON public.tracks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DOCUMENTS
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  folder TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents_own" ON public.documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FOCUS SESSIONS
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_minutes NUMERIC NOT NULL DEFAULT 0,
  label TEXT,
  mode TEXT NOT NULL DEFAULT 'focus',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_sessions TO authenticated;
GRANT ALL ON public.focus_sessions TO service_role;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "focus_sessions_own" ON public.focus_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX focus_sessions_user_started_idx ON public.focus_sessions (user_id, started_at DESC);

-- ROOM ITEMS
CREATE TABLE public.room_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  x NUMERIC NOT NULL DEFAULT 50,
  y NUMERIC NOT NULL DEFAULT 50,
  scale NUMERIC NOT NULL DEFAULT 1,
  rotation NUMERIC NOT NULL DEFAULT 0,
  z_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_items TO authenticated;
GRANT ALL ON public.room_items TO service_role;
ALTER TABLE public.room_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "room_items_own" ON public.room_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER room_items_updated_at BEFORE UPDATE ON public.room_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();