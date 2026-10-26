// FileUploader.jsx (UI Redesign - Premium File Management)
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useSocket } from '../context/SocketProvider.jsx';
import { CloudUpload, FileText, Download, Trash2, FolderOpen } from 'lucide-react';

// External Service Imports (Functionality remains UNCHANGED)
import { uploadFile } from '../services/fileupload.js';
import { getFiles } from '../services/getFiles.js';
import { downloadFile } from '../services/downloadFile.js';
import { deleteFile } from '../services/deleteFile.js';

// Design Tokens (Imported for consistency)
const DESIGN_TOKENS = {
  colors: {
    primary: '#0066FF',       
    primaryHover: '#0052CC',
    secondary: '#FF3B30',   
    surface: '#FFFFFF',
    surfaceElevated: '#F5F5F7', 
    border: '#E5E5EA',
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
      tertiary: '#AEAEB2'
    },
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
  },
  radius: {
    lg: '16px',
    xl: '24px',
  }
};

const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.gradient;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;


const FileUploader = ({ refreshKey, room }) => {
  const socket = useSocket();
  const fileInputRef = useRef();
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const onUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (selectedFile) => {
    setUploadError(null);
    if (!selectedFile) return;

    if (selectedFile.size > 20 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size is 20MB.');
      return;
    }

    setFile(selectedFile);
  };

  // --- START: Existing Functionality (REFACTOR: Consolidated file fetching) ---

  const fetchFiles = useCallback(async () => {
    if (room) {
      const data = await getFiles(room);
      setUploadedFiles(data?.files || []);
    }
  }, [room]);

  useEffect(() => {
    fetchFiles();
  }, [refreshKey, room, fetchFiles]);

  useEffect(() => {
    if (!socket) return;

    // Listeners to refresh file list on events
    const handleFileEvent = () => {
      fetchFiles();
    };
    
    socket.on('file:shared', handleFileEvent);
    socket.on('file:deleted', handleFileEvent);

    return () => {
      socket.off('file:shared', handleFileEvent);
      socket.off('file:deleted', handleFileEvent);
    };
  }, [socket, room, fetchFiles]);

  // Upload Logic (Triggered by file state change)
  useEffect(() => {
    const upload = async () => {
      if (file && room) {
        setIsUploading(true);
        setUploadError(null);

        const data = new FormData();
        data.append('room', room);
        data.append('name', file.name);
        data.append('file', file);

        try {
          await uploadFile(data);
          fetchFiles(); // Refresh file list
        } catch (error) {
          console.error("Upload failed:", error);
          setUploadError(error.message || 'File upload failed. Please try again.');
        } finally {
          setIsUploading(false);
          setFile(null); // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }
    };
    upload();
  }, [file, room, fetchFiles]);

  // Delete Handler
  const handleDelete = useCallback(async (fileId) => {
    try {
      await deleteFile(fileId);
      fetchFiles();
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  }, [fetchFiles]);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Enhanced Drop Zone Classes
  const dropZoneClasses = `
    w-full p-6 border-2 border-dashed rounded-xl
    flex flex-col items-center justify-center text-center
    transition-all duration-300 cursor-pointer
    ${isDragging
      ? 'shadow-md border-solid scale-[1.01]'
      : 'shadow-sm hover:shadow-md'
    }
  `;

  return (
    <div
      className="h-full w-full p-0 flex flex-col font-sans overflow-hidden"
      style={{ backgroundColor: SURFACE_BG }}
    >
      <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
        {/* Header */}
        <div
          className="pb-3 mb-3 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}
        >
          <h2
            className="text-xl font-bold flex items-center"
            style={{ color: PRIMARY_TEXT }}
          >
            <FolderOpen size={20} style={{ color: PRIMARY_COLOR }} className="mr-2"/>
            Shared Files
          </h2>
          <span className="text-sm font-medium" style={{ color: SECONDARY_TEXT }}>
            Room: {room}
          </span>
        </div>

        {/* Error notification banner */}
        {uploadError && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start justify-between text-xs text-red-700 flex-shrink-0">
            <span>{uploadError}</span>
            <button
              onClick={() => setUploadError(null)}
              className="ml-2 font-bold hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* File Drop Zone Area */}
        <div 
          className={`${dropZoneClasses} flex-shrink-0`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            borderColor: isDragging ? PRIMARY_COLOR : BORDER_COLOR,
            backgroundColor: isDragging ? ELEVATED_BG : SURFACE_BG,
            color: PRIMARY_TEXT,
            marginBottom: '0.75rem',
          }}
        >
          <CloudUpload size={32} style={{ color: PRIMARY_COLOR }} />

          <p className="mt-2 text-base font-semibold">
            {isUploading ? 'Uploading...' : 'Drag & Drop your file here'}
          </p>
          <p className="text-xs" style={{ color: SECONDARY_TEXT }}>
            (Max: 20MB — PDF, Word, TXT, Images)
          </p>

          <div className="flex items-center space-x-2 w-full my-3">
            <div className="flex-grow h-px" style={{ backgroundColor: BORDER_COLOR }}></div>
            <span className="text-xs uppercase font-medium" style={{ color: SECONDARY_TEXT }}>OR</span>
            <div className="flex-grow h-px" style={{ backgroundColor: BORDER_COLOR }}></div>
          </div>

          {/* Select File Button */}
          <button 
            type="button"
            onClick={onUploadClick}
            disabled={isUploading}
            className="mt-2 px-6 py-2 rounded-full text-sm font-semibold shadow-md transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none disabled:opacity-60"
            style={{
              background: ACCENT_GRADIENT,
              color: SURFACE_BG,
            }}
          >
            {isUploading ? 'Processing...' : 'Select File'}
          </button>

          <input
            ref={fileInputRef}
            style={{ display: "none" }}
            type="file"
            id="file-upload"
            accept=".pdf,.docx,.doc,.txt,.md,.csv,.jpg,.jpeg,.png,.webp,.gif"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* Uploaded Files Section with dedicated visible scrollbar */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ backgroundColor: SURFACE_BG }}>
          <h3 className="text-sm font-semibold mb-2 flex-shrink-0" style={{ color: PRIMARY_TEXT }}>
            Shared Documents ({uploadedFiles.length})
          </h3>
          
          <div 
            className="flex-1 overflow-y-auto space-y-2 pr-1.5"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(140, 140, 150, 0.4) transparent',
            }}
          >
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <div 
                  key={file._id || index} 
                  className="p-3 flex justify-between items-center rounded-lg border transition-all duration-200 hover:shadow-sm"
                  style={{ backgroundColor: ELEVATED_BG, borderColor: BORDER_COLOR }}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText size={18} style={{ color: PRIMARY_COLOR }} className="flex-shrink-0" />
                    <span className="text-sm font-medium truncate" style={{ color: PRIMARY_TEXT }}>
                      {file.name}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={() => downloadFile(file._id, file.name)}
                      className="p-1.5 rounded-full transition-colors duration-200 hover:bg-gray-200"
                      style={{ color: PRIMARY_COLOR }}
                      title="Download File"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-1.5 rounded-full transition-colors duration-200 hover:bg-red-100"
                      style={{ color: DESIGN_TOKENS.colors.secondary }}
                      title="Delete File"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs" style={{ color: SECONDARY_TEXT }}>
                No documents shared in this room yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUploader;