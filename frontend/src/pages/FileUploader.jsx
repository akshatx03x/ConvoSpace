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
    primary: '#0066FF',       // Vibrant blue
    primaryHover: '#0052CC',
    secondary: '#FF3B30',     // Accent red for delete
    surface: '#FFFFFF',
    surfaceElevated: '#F5F5F7', // Light gray background
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
  const [isDragging, setIsDragging] = useState(false); // Using this state visually
  const [isUploading, setIsUploading] = useState(false);

  const onUploadClick = () => {
    fileInputRef.current.click();
  }

  // --- START: Existing Functionality (REFACTOR: Consolidated file fetching) ---

  const fetchFiles = useCallback(async () => {
    if (room) {
      const data = await getFiles(room);
      setUploadedFiles(data.files || []);
    }
  }, [room]);

  useEffect(() => {
    fetchFiles();
  }, [refreshKey, room, fetchFiles]);

  useEffect(() => {
    if (!socket) return;

    // Listeners to refresh file list on events
    const handleFileEvent = (data) => {
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
        const data = new FormData();
        data.append('name', file.name);
        data.append('file', file);
        data.append('room', room);

        try {
          await uploadFile(data, room);
          fetchFiles(); // Refresh file list
        } catch (error) {
          console.error("Upload failed:", error);
        } finally {
          setIsUploading(false);
          setFile(null); // Clear file input
        }
      }
    }
    upload();
  }, [file, room, fetchFiles])

  // Delete Handler
  const handleDelete = useCallback(async (fileId) => {
    try {
      await deleteFile(fileId);
      fetchFiles();
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  }, [fetchFiles]);

  // --- END: Existing Functionality ---

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
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div
          className="pb-4 mb-4 flex items-center justify-between"
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

        {/* File Drop Zone Area */}
        <div 
          className={dropZoneClasses}
          style={{
            borderColor: isDragging ? PRIMARY_COLOR : BORDER_COLOR,
            backgroundColor: isDragging ? ELEVATED_BG : SURFACE_BG,
            color: PRIMARY_TEXT,
            marginBottom: '1rem',
          }}
        >
          <CloudUpload size={32} style={{ color: PRIMARY_COLOR }} />

          <p className="mt-2 text-base font-semibold">
            {isUploading ? 'Uploading...' : 'Drag & Drop your file here'}
          </p>
          <p className="text-xs" style={{ color: SECONDARY_TEXT }}>
            (Max: 5MB, PDF, DOCX, TXT)
          </p>

          <div className="flex items-center space-x-2 w-full my-3">
            <div className="flex-grow h-px" style={{ backgroundColor: BORDER_COLOR }}></div>
            <span className="text-xs uppercase font-medium" style={{ color: SECONDARY_TEXT }}>OR</span>
            <div className="flex-grow h-px" style={{ backgroundColor: BORDER_COLOR }}></div>
          </div>

          {/* Select File Button */}
          <button 
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
            style={{display:"none"}}
            type="file"
            id="file-upload"
            onChange={(e) => {
              if(e.target.files.length > 0) setFile(e.target.files[0]);
            }}
          />
        </div>

        {/* Uploaded Files List */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: SURFACE_BG }}>
          <h3 className="text-sm font-semibold mb-2" style={{ color: PRIMARY_TEXT }}>Shared Documents ({uploadedFiles.length})</h3>
          
          <div className="space-y-2">
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <div 
                  key={index} 
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
              <p className="mt-4 text-center text-sm" style={{ color: SECONDARY_TEXT }}>
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