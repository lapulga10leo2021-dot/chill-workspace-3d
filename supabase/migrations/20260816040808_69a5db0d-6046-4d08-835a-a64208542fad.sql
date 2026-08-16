-- media buckets: readable by signed-in users, writable only in own folder
CREATE POLICY "media_read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('backgrounds','tracks'));

CREATE POLICY "media_insert_own" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('backgrounds','tracks') AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "media_update_own" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('backgrounds','tracks') AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "media_delete_own" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('backgrounds','tracks') AND (storage.foldername(name))[1] = auth.uid()::text);

-- documents: fully private per user
CREATE POLICY "documents_all_own" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);