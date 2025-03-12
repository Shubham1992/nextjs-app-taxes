'use client';

import { useState } from 'react';
import { XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

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
          className={`flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer ${
            dragActive ? "border-blue-500" : "border-gray-300"
          } hover:border-gray-400`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PDF, JPG, JPEG, or PNG files
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
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <DocumentIcon className="h-6 w-6 text-gray-500" />
            <span className="text-sm text-gray-700 truncate">
              {selectedFile.name}
            </span>
          </div>
          <button
            onClick={removeFile}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
} 