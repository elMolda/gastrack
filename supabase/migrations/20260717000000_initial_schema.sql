CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.users (
	id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	email TEXT UNIQUE NOT NULL,
	username TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
	INSERT INTO public.users (id, email, username)
	VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username')
	ON CONFLICT (id) DO NOTHING;
	RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
	AFTER INSERT ON auth.users
	FOR EACH ROW
	EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.cars (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	brand TEXT NOT NULL,
	model TEXT NOT NULL,
	year INTEGER NOT NULL,
	license_plate TEXT,
	picture_url TEXT,
	is_default BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.fuel_logs (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
	car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
	date DATE NOT NULL,
	distance NUMERIC(10, 2) NOT NULL,
	dist_unit TEXT NOT NULL CHECK (dist_unit IN ('km', 'mi')),
	fuel NUMERIC(10, 2) NOT NULL,
	fuel_unit TEXT NOT NULL CHECK (fuel_unit IN ('gal', 'L')),
	price NUMERIC(10, 2) NOT NULL,
	drive_type TEXT NOT NULL CHECK (drive_type IN ('city', 'mixed', 'highway')),
	car_reported NUMERIC(10, 2),
	car_reported_unit TEXT CHECK (car_reported_unit IN ('km/gal', 'km/L', 'MPG', 'L/100km')),
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fuel_logs_user_id ON public.fuel_logs(user_id);
CREATE INDEX idx_fuel_logs_car_id ON public.fuel_logs(car_id);
CREATE INDEX idx_fuel_logs_date ON public.fuel_logs(date);
CREATE INDEX idx_cars_user_id ON public.cars(user_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
	ON public.users FOR SELECT
	USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
	ON public.users FOR UPDATE
	USING (auth.uid() = id);

CREATE POLICY "Users can view own cars"
	ON public.cars FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cars"
	ON public.cars FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars"
	ON public.cars FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars"
	ON public.cars FOR DELETE
	USING (auth.uid() = user_id);

CREATE POLICY "Users can view own fuel logs"
	ON public.fuel_logs FOR SELECT
	USING (auth.uid() = user_id);

CREATE POLICY "Users can create own fuel logs"
	ON public.fuel_logs FOR INSERT
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fuel logs"
	ON public.fuel_logs FOR UPDATE
	USING (auth.uid() = user_id)
	WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fuel logs"
	ON public.fuel_logs FOR DELETE
	USING (auth.uid() = user_id);

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cars TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_logs TO authenticated;
GRANT ALL ON public.users, public.cars, public.fuel_logs TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$;

CREATE TRIGGER update_users_updated_at
	BEFORE UPDATE ON public.users
	FOR EACH ROW
	EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
	BEFORE UPDATE ON public.cars
	FOR EACH ROW
	EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fuel_logs_updated_at
	BEFORE UPDATE ON public.fuel_logs
	FOR EACH ROW
	EXECUTE FUNCTION public.update_updated_at_column();

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
		CREATE PUBLICATION supabase_realtime;
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_publication_tables
		WHERE pubname = 'supabase_realtime'
			AND schemaname = 'public'
			AND tablename = 'cars'
	) THEN
		ALTER PUBLICATION supabase_realtime ADD TABLE public.cars;
	END IF;

	IF NOT EXISTS (
		SELECT 1
		FROM pg_publication_tables
		WHERE pubname = 'supabase_realtime'
			AND schemaname = 'public'
			AND tablename = 'fuel_logs'
	) THEN
		ALTER PUBLICATION supabase_realtime ADD TABLE public.fuel_logs;
	END IF;
END;
$$;
