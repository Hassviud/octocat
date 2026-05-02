
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- Restrict listing of storage objects in product-images: only allow direct file access via public URLs.
DROP POLICY IF EXISTS "product images public read" ON storage.objects;
CREATE POLICY "product images authenticated list" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'product-images');
