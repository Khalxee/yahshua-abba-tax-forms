-- Create storage bucket for taxpayer documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('taxpayer-documents', 'taxpayer-documents', false);

-- Create policies for document uploads
CREATE POLICY "Users can upload their own documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'taxpayer-documents');

CREATE POLICY "Users can view their own documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'taxpayer-documents');

CREATE POLICY "Users can update their own documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'taxpayer-documents');

CREATE POLICY "Users can delete their own documents" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'taxpayer-documents');