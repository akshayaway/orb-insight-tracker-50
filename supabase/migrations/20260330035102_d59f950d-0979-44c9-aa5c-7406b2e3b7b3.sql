-- Add journal_slug column (no unique constraint yet)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS journal_slug text;

-- Backfill with duplicate handling: append row number for duplicates
WITH ranked AS (
  SELECT id, 
    lower(regexp_replace(discord_username, '[^a-zA-Z0-9]', '', 'g')) as base_slug,
    ROW_NUMBER() OVER (
      PARTITION BY lower(regexp_replace(discord_username, '[^a-zA-Z0-9]', '', 'g'))
      ORDER BY created_at ASC
    ) as rn
  FROM public.user_profiles
  WHERE discord_username IS NOT NULL AND discord_username != ''
)
UPDATE public.user_profiles p
SET journal_slug = CASE 
  WHEN r.rn = 1 THEN r.base_slug
  ELSE r.base_slug || r.rn::text
END
FROM ranked r
WHERE p.id = r.id;

-- Now add unique constraint
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_journal_slug_key UNIQUE (journal_slug);

-- Create trigger function to auto-set journal_slug from discord_username
CREATE OR REPLACE FUNCTION public.set_journal_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  base_slug text;
  final_slug text;
  counter int := 1;
BEGIN
  IF NEW.discord_username IS NOT NULL AND NEW.discord_username != '' THEN
    base_slug := lower(regexp_replace(NEW.discord_username, '[^a-zA-Z0-9]', '', 'g'));
    final_slug := base_slug;
    LOOP
      -- Check if slug already exists for a different user
      IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE journal_slug = final_slug AND id != NEW.id
      ) THEN
        EXIT;
      END IF;
      counter := counter + 1;
      final_slug := base_slug || counter::text;
    END LOOP;
    NEW.journal_slug := final_slug;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER set_journal_slug_trigger
BEFORE INSERT OR UPDATE OF discord_username ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_journal_slug();

-- Update RLS policy
DROP POLICY IF EXISTS "Anyone can read public journal profiles by share_id" ON public.user_profiles;
CREATE POLICY "Anyone can read public journal profiles"
ON public.user_profiles
FOR SELECT
TO public
USING (
  (is_public_journal = true) AND (share_id IS NOT NULL OR journal_slug IS NOT NULL)
);