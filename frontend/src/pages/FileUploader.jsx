import React, { useEffect } from 'react';
import { useRef, useState } from 'react';
import { useSocket } from '../context/SocketProvider.jsx';
const THEME_LIGHT_CARD_BG = '#F0EBEA';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';

import { uploadFile } from '../services/fileupload.js';
import { getFiles } from '../services/getFiles.js';
import { downloadFile } from '../services/downloadFile.js';

const UploadCloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-upload">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.243"/>
        <path d="M12 12v9"/>
        <path d="m16 16-4-4-4 4"/>
    </svg>
);

const FileUploader = ({ refreshKey, room }) => {
    const socket = useSocket();
    // This state is purely for visual feedback/placeholding, as requested.
    const isDragging = false;
    const fileInputRef = useRef();
    const [file, setFile] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const onUploadClick = () => {
        fileInputRef.current.click();
    }

    useEffect(() => {
        const fetchFiles = async () => {
            if (room) {
                const data = await getFiles(room);
                setUploadedFiles(data.files || []);
            }
        };
        fetchFiles();
    }, [refreshKey, room]);

    useEffect(() => {
        if (socket) {
            socket.on('file:shared', (data) => {
                // Refresh the file list when a new file is shared
                const fetchFiles = async () => {
                    if (room) {
                        const updatedData = await getFiles(room);
                        setUploadedFiles(updatedData.files || []);
                    }
                };
                fetchFiles();
            });
        }
    }, [socket, room]);

    useEffect(() => {
        const getfile=async()=>{
            if(file && room){
                const data= new FormData();
                data.append('name',file.name);
                data.append('file',file);
                data.append('room', room);
                let response= await uploadFile(data, room);
                if (response) {
                    // Refresh the file list after upload
                    const updatedData = await getFiles(room);
                    setUploadedFiles(updatedData.files || []);
                }
            }
        }
        getfile();
    }, [file, room])
    const dropZoneClasses = `
        w-full p-4 border-4 border-dashed rounded-2xl
        flex flex-col items-center justify-center text-center
        transition-all duration-300 cursor-pointer
        ${isDragging
            ? 'shadow-xl scale-[1.01]'
            : 'shadow-md hover:shadow-lg'
        }
    `;

    return (
        <div
            className="h-full w-full p-4 flex flex-col font-sans overflow-y-auto rounded-xl"
            style={{ backgroundColor: THEME_LIGHT_CARD_BG }}
        >
            <div className="flex-1">
                <div
                    className="p-4 rounded-xl shadow-lg h-full flex flex-col"
                    style={{ backgroundColor: 'white' }}
                >
                    <h2
                        className="text-2xl font-bold mb-4 text-center"
                        style={{ color: THEME_ACCENT_COLOR }}
                    >
                        Upload Documents
                    </h2>

                    {/* File Drop Zone Area */}
                    <div
                        className={dropZoneClasses}
                        style={{
                            borderColor: THEME_ACCENT_COLOR + (isDragging ? '' : '60'), // Lighter border when not dragging
                            backgroundColor: isDragging ? THEME_LIGHT_CARD_BG : 'white',
                            color: THEME_TEXT_COLOR
                        }}
                    >
                        <UploadCloudIcon />

                        <p className="mt-2 text-base font-semibold">
                            Drag & Drop your file here
                        </p>
                        <p className="text-xs opacity-70 mb-4">
                            (Max: 5MB, PDF, DOCX, TXT)
                        </p>

                        <div className="flex items-center space-x-2 w-full">
                            <div className="flex-grow h-px" style={{ backgroundColor: THEME_ACCENT_COLOR + '60' }}></div>
                            <span className="text-xs uppercase font-medium" style={{ color: THEME_ACCENT_COLOR }}>OR</span>
                            <div className="flex-grow h-px" style={{ backgroundColor: THEME_ACCENT_COLOR + '60' }}></div>
                        </div>

                        {/* Select File Button */}
                        <button onClick={()=>onUploadClick()}
                            className="mt-4 px-6 py-2 rounded-full text-sm font-medium shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none"
                            style={{
                                backgroundColor: THEME_ACCENT_COLOR,
                                color: 'white',
                            }}
                        >
                            Select File
                        </button>

                        <input
                            ref={fileInputRef}
                            style={{display:"none"}}
                            type="file"
                            className="hidden"
                            id="file-upload"
                            onChange={(e)=>{
                                setFile(e.target.files[0])
                            }}
                        />
                    </div>

                    {/* Uploaded Files List */}
                    <div className="mt-4 p-3 rounded-lg text-xs flex-1" style={{ backgroundColor: THEME_LIGHT_CARD_BG, color: THEME_TEXT_COLOR }}>
                        <p className="font-medium" style={{ color: THEME_ACCENT_COLOR }}>Uploaded Files:</p>
                        {uploadedFiles.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                                {uploadedFiles.map((file, index) => (
                                    <li key={index} className="text-xs flex justify-between items-center">
                                        <span>{file.name}</span>
                                        <button
                                            onClick={() => downloadFile(file._id, file.name)}
                                            className="ml-2 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                                        >
                                            Download
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mt-2">No files uploaded yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FileUploader;
