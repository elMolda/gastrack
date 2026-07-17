-- Keep the most recently created default vehicle for each user.
WITH ranked_defaults AS (
	SELECT
		id,
		ROW_NUMBER() OVER (
			PARTITION BY user_id
			ORDER BY created_at DESC, id DESC
		) AS position
	FROM public.cars
	WHERE is_default = TRUE
)
UPDATE public.cars AS cars
SET is_default = FALSE
FROM ranked_defaults
WHERE cars.id = ranked_defaults.id
	AND ranked_defaults.position > 1;

-- A user may have at most one default vehicle.
CREATE UNIQUE INDEX IF NOT EXISTS cars_one_default_per_user
	ON public.cars (user_id)
	WHERE is_default = TRUE;
