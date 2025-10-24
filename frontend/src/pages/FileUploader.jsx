import React from 'react';

// --- Theme Constants (Copied from GeminiChatUI for consistency) ---
const THEME_LIGHT_CARD_BG = '#F0EBEA';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';

// Icon imports (assuming Lucide or similar icon library is available)
const UploadCloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-upload">
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.243"/>
        <path d="M12 12v9"/>
        <path d="m16 16-4-4-4 4"/>
    </svg>
);

const FileUploader = () => {
    // This state is purely for visual feedback/placeholding, as requested.
    const isDragging = false; 

    const dropZoneClasses = `
        w-full p-8 md:p-12 border-4 border-dashed rounded-3xl
        flex flex-col items-center justify-center text-center
        transition-all duration-300 cursor-pointer
        ${isDragging 
            ? 'shadow-xl scale-[1.01]' 
            : 'shadow-md hover:shadow-lg'
        }
    `;

    return (
        <div 
            className="min-h-screen p-4 flex items-center justify-center font-sans"
            style={{ backgroundColor: THEME_LIGHT_CARD_BG }}
        >
            <div className="w-full max-w-lg mx-auto">
                <div 
                    className="p-6 rounded-2xl shadow-2xl" 
                    style={{ backgroundColor: 'white' }}
                >
                    <h2 
                        className="text-3xl font-bold mb-6 text-center"
                        style={{ color: THEME_ACCENT_COLOR }}
                    >
                        Upload Your Documents
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
                        
                        <p className="mt-4 text-lg font-semibold">
                            Drag & Drop your file here
                        </p>
                        <p className="text-sm opacity-70 mb-6">
                            (Max file size: 5MB, supported formats: PDF, DOCX, TXT)
                        </p>

                        <div className="flex items-center space-x-4 w-full">
                            <div className="flex-grow h-px" style={{ backgroundColor: THEME_ACCENT_COLOR + '60' }}></div>
                            <span className="text-xs uppercase font-medium" style={{ color: THEME_ACCENT_COLOR }}>OR</span>
                            <div className="flex-grow h-px" style={{ backgroundColor: THEME_ACCENT_COLOR + '60' }}></div>
                        </div>

                        {/* Select File Button */}
                        <button
                            className="mt-6 px-8 py-3 rounded-full text-base font-medium shadow-xl transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none"
                            style={{ 
                                backgroundColor: THEME_ACCENT_COLOR, 
                                color: 'white',
                                // Mimics the button styling from the chat component
                            }}
                        >
                            Select File to Upload
                        </button>

                        <input 
                            type="file" 
                            className="hidden" 
                            id="file-upload"
                            // A real input element would be hidden and triggered by the button click
                        />
                    </div>

                    {/* Placeholder for upload status or list */}
                    <div className="mt-6 p-4 rounded-xl text-sm" style={{ backgroundColor: THEME_LIGHT_CARD_BG, color: THEME_TEXT_COLOR }}>
                        <p className="font-medium" style={{ color: THEME_ACCENT_COLOR }}>Upload Status Placeholder:</p>
                        <p>Awaiting file selection...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FileUploader;
