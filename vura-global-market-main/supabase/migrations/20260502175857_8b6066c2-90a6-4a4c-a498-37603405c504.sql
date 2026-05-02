CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product ON public.reviews(product_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews public read"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "reviews self insert"
ON public.reviews FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews self update"
ON public.reviews FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "reviews self or admin delete"
ON public.reviews FOR DELETE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.refresh_product_rating(_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM public.reviews WHERE product_id = _product_id), 0),
      reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE product_id = _product_id),
      updated_at = now()
  WHERE id = _product_id;
END; $$;

CREATE OR REPLACE FUNCTION public.handle_review_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_product_rating(OLD.product_id);
    RETURN OLD;
  ELSE
    PERFORM public.refresh_product_rating(NEW.product_id);
    RETURN NEW;
  END IF;
END; $$;

CREATE TRIGGER trg_reviews_aggregate
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.handle_review_change();