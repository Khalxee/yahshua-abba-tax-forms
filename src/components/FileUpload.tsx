import { useState } from "react";
import { Upload, FileText, Image, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

const FileUpload = () => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: FileUpload[] = Array.from(selectedFiles).map((file) => ({
      id: Math.random().toString(36),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (fileUpload) => {
        const fileName = `${Date.now()}-${fileUpload.name}`;
        const { error } = await supabase.storage
          .from('taxpayer-documents')
          .upload(fileName, fileUpload.file);

        if (error) throw error;
        return fileName;
      });

      await Promise.all(uploadPromises);
      
      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) have been uploaded`,
      });

      setFiles([]);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-input rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Upload Documents & Pictures</h3>
              <p className="text-sm text-muted-foreground">
                Select files or drag and drop them here
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: PDF, DOC, DOCX, JPG, PNG, GIF (Max 10MB per file)
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Selected Files ({files.length})</h4>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.type)}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              onClick={uploadFiles} 
              disabled={uploading}
              className="w-full mt-4"
            >
              {uploading ? "Uploading..." : "Upload All Files"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-3">Required Documents</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Valid Government ID (Driver's License, Passport, etc.)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>BIR Certificate of Registration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Supporting Financial Documents</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>Additional Supporting Documents (if applicable)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;