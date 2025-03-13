'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedFileTypes?: string;
}

export default function FileUpload({ onFileSelect, onFileRemove, acceptedFileTypes = ".pdf,.jpg,.jpeg,.png" }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    onFileRemove();
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <label
          htmlFor="file-upload"
          className={cn(
            "flex items-center justify-center w-full h-10 px-2 transition border-2 border-dashed rounded-lg cursor-pointer",
            dragActive 
              ? "border-primary" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Upload file
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept={acceptedFileTypes}
            onChange={handleChange}
            id="file-upload"
          />
        </label>
      ) : (
        <Card className="flex items-center justify-between p-2 h-10">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate max-w-[120px]">
              {selectedFile.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      )}
    </div>
  );
} 