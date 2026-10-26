// FileUploader.jsx (UI Redesign - Premium File Management)
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useSocket } from '../context/SocketProvider.jsx';
import { CloudUpload, FileText, Download, Trash2, FolderOpen } from 'lucide-react';

// External Service Imports (Functionality remains UNCHANGED)
import { uploadFile } from '../services/fileupload.js';
import { getFiles } from '../services/getFiles.js';
import { downloadFile } from '../services/downloadFile.js';
import { deleteFile } from '../services/deleteFile.js';

// Design Tokens (Identical to Notepad.jsx for 100% visual harmony)
const DESIGN_TOKENS = {
  colors: {
    primary: '#007AFF',       // Brighter Blue
    primaryDark: '#005ACF',
    secondary: '#FF4500',     // Orange-red
    tertiary: '#AF52DE',      // Purple
    surface: '#FFFFFF',       // Pure white
    surfaceElevated: '#F0F2F5', // Lightest grey
    surfaceHighlight: '#E0E5EC', // Slightly darker for active states
    border: '#E0E0E0',        // Light border
    text: {
      primary: '#1C1C1E',     // Darkest grey
      secondary: '#6A6A6A',   // Medium grey
      placeholder: '#A0A0A0',
      white: '#FFFFFF'
    },
    accentGradient: 'linear-gradient(45deg, #007AFF, #5AC8FA)',
    success: '#4CAF50',
    delete: '#FF3B30',
  },
  shadows: {
    sm: '0px 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0px 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0px 8px 24px rgba(0, 0, 0, 0.16)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    xl: '30px',
    full: '9999px',
  }
};

const PRIMARY_COLOR = DESIGN_TOKENS.colors.primary;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.accentGradient;


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
    w-full p-4 border-2 border-dashed rounded-lg
    flex flex-col items-center justify-center text-center
    transition-all duration-200 cursor-pointer
    ${isDragging
      ? 'border-solid scale-[1.01]'
      : 'hover:border-solid'
    }
  `;

  return (
    <div
      className="h-full w-full flex flex-col font-sans rounded-xl overflow-hidden"
      style={{
        backgroundColor: ELEVATED_BG,
        color: PRIMARY_TEXT,
        boxShadow: DESIGN_TOKENS.shadows.lg,
        borderRadius: DESIGN_TOKENS.radius.xl,
      }}
    >
      {/* Header (Aligned with Notepad.jsx) */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          backgroundColor: SURFACE_BG,
          borderBottom: `1px solid ${BORDER_COLOR}`,
          boxShadow: DESIGN_TOKENS.shadows.sm,
        }}
      >
        <div className="flex items-center">
          <FolderOpen size={20} style={{ color: PRIMARY_COLOR }} className="mr-3" />
          <span className="text-lg font-semibold" style={{ color: PRIMARY_TEXT }}>Shared Files</span>
        </div>
        <span className="text-sm font-medium" style={{ color: SECONDARY_TEXT }}>
          Room: {room}
        </span>
      </div>

      {/* Error notification banner */}
      {uploadError && (
        <div className="m-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start justify-between text-xs text-red-700 flex-shrink-0">
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
      <div className="p-4 flex-shrink-0" style={{ backgroundColor: SURFACE_BG, borderBottom: `1px solid ${BORDER_COLOR}` }}>
        <div 
          className={dropZoneClasses}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            borderColor: isDragging ? PRIMARY_COLOR : BORDER_COLOR,
            backgroundColor: isDragging ? '#EBF3FF' : ELEVATED_BG,
            color: PRIMARY_TEXT,
            borderRadius: DESIGN_TOKENS.radius.md,
            boxShadow: DESIGN_TOKENS.shadows.sm,
          }}
        >
          <CloudUpload size={28} style={{ color: PRIMARY_COLOR }} />

          <p className="mt-1.5 text-sm font-semibold max-w-full px-2 text-center" style={{ color: PRIMARY_TEXT, wordBreak: 'break-word' }}>
            {isUploading ? (
              <span className="inline-flex items-center space-x-1.5 text-blue-600">
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent flex-shrink-0" />
                <span className="break-words">Uploading {file?.name || 'file'}...</span>
              </span>
            ) : (
              'Drag & Drop your file here'
            )}
          </p>
          <p className="text-xs" style={{ color: SECONDARY_TEXT }}>
            (PDF, Word, TXT, Images — Max 20MB)
          </p>

          <button 
            type="button"
            onClick={onUploadClick}
            disabled={isUploading}
            className="mt-2.5 px-6 py-2 rounded-full text-sm font-semibold transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{
              background: ACCENT_GRADIENT,
              color: DESIGN_TOKENS.colors.text.white,
              boxShadow: DESIGN_TOKENS.shadows.md,
            }}
          >
            {isUploading ? 'Uploading...' : 'Browse File'}
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
      </div>

      {/* Uploaded Files Section */}
      <div className="flex-1 p-4 flex flex-col min-h-0 overflow-hidden" style={{ backgroundColor: ELEVATED_BG }}>
        <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
          <h3 className="text-sm font-semibold" style={{ color: PRIMARY_TEXT }}>
            Shared Documents
          </h3>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: SURFACE_BG, color: SECONDARY_TEXT, border: `1px solid ${BORDER_COLOR}` }}
          >
            {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'}
          </span>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto space-y-2.5 pr-1"
          style={{
            scrollbarWidth: 'thin',
          }}
        >
          {uploadedFiles.length > 0 ? (
            uploadedFiles.map((uploadedFileItem, index) => {
              const fileName = uploadedFileItem.name || 'Untitled File';
              const fileExt = fileName.includes('.') 
                ? fileName.split('.').pop().toUpperCase() 
                : 'FILE';

              return (
                <div 
                  key={uploadedFileItem._id || index} 
                  className="p-3 flex flex-col rounded-xl shadow-xs transition-all duration-150 hover:shadow-md border"
                  style={{ 
                    backgroundColor: SURFACE_BG, 
                    borderColor: BORDER_COLOR,
                    borderLeft: `4px solid ${PRIMARY_COLOR}`,
                    boxShadow: DESIGN_TOKENS.shadows.sm,
                  }}
                >
                  {/* Complete File Name Row */}
                  <div className="flex items-start space-x-2.5 w-full">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: '#EBF3FF' }}
                    >
                      <FileText size={16} style={{ color: PRIMARY_COLOR }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span 
                        className="text-sm font-semibold block select-text leading-snug"
                        style={{ 
                          color: PRIMARY_TEXT, 
                          wordBreak: 'break-word', 
                          overflowWrap: 'anywhere' 
                        }}
                        title={fileName}
                      >
                        {fileName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Metadata and Actions Row */}
                  <div 
                    className="flex items-center justify-between mt-2.5 pt-2 border-t"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ backgroundColor: ELEVATED_BG, color: SECONDARY_TEXT, border: `1px solid ${BORDER_COLOR}` }}
                    >
                      {fileExt}
                    </span>

                    <div className="flex space-x-1.5 flex-shrink-0">
                      <button
                        onClick={() => downloadFile(uploadedFileItem._id, fileName)}
                        className="text-xs font-semibold py-1 px-2.5 rounded-full transition-colors hover:bg-blue-600 hover:text-white flex items-center"
                        style={{ border: `1px solid ${PRIMARY_COLOR}`, color: PRIMARY_COLOR, backgroundColor: '#F8FAFF' }}
                        title={`Download ${fileName}`}
                      >
                        <Download size={12} className="mr-1" /> Download
                      </button>
                      <button
                        onClick={() => handleDelete(uploadedFileItem._id)}
                        className="text-xs font-semibold py-1 px-2.5 rounded-full text-white transition-colors bg-red-500 hover:bg-red-600 flex items-center"
                        style={{ backgroundColor: DESIGN_TOKENS.colors.delete }}
                        title={`Delete ${fileName}`}
                      >
                        <Trash2 size={12} className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6" style={{ color: SECONDARY_TEXT }}>
              <FolderOpen size={40} style={{ color: PRIMARY_COLOR }} className="mb-2 opacity-60" />
              <p className="text-sm font-medium" style={{ color: PRIMARY_TEXT }}>
                No files shared yet
              </p>
              <p className="text-xs mt-1 max-w-[200px]">
                Uploaded files and meeting attachments will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileUploader;