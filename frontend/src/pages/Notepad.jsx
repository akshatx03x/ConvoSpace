// Notepad.jsx (UI Redesign - Card-based Notes & Premium Theme - LOGIC VERIFIED)
import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketProvider';
import { NotebookPen, Save, Edit2, Trash2, Share2, PlusCircle, MessageSquare, X } from 'lucide-react'; // Added X icon

// Design Tokens (Using the consistent set)
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
    aiGradient: 'linear-gradient(90deg, #AF52DE, #FF00FF)',
    success: '#4CAF50', // Green for success/share
    delete: '#FF3B30', // Red for delete
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
const HIGHLIGHT_BG = DESIGN_TOKENS.colors.surfaceHighlight;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.accentGradient;


const Notepad = ({ room }) => {
    // NOTE: This application uses localStorage for simple persistence.
    // For production or collaborative apps, use a proper database like Firestore.
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);

    // Load saved notes from localStorage on mount or when room changes
    useEffect(() => {
        const savedNotes = JSON.parse(localStorage.getItem(`notes_${room}`)) || [];
        setNotes(savedNotes);
    }, [room]);

    // Save notes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(`notes_${room}`, JSON.stringify(notes));
    }, [notes, room]);

    const socket = useSocket();

    // Listen for clear notes event from socket
    useEffect(() => {
        if (socket) {
            const handleClearNotes = () => {
                setNotes([]);
                localStorage.removeItem(`notes_${room}`);
            };

            socket.on('clear:notes', handleClearNotes);

            return () => {
                socket.off('clear:notes', handleClearNotes);
            };
        }
    }, [socket, room]);

    const handleSaveNote = () => {
        // LOGIC VERIFIED: Core save/update logic is maintained.
        if (!title.trim() && !content.trim()) return;

        if (editingIndex !== null) {
            // Update existing note
            const updatedNotes = [...notes];
            updatedNotes[editingIndex] = { title: title.trim(), content: content.trim(), date: new Date().toLocaleString() };
            setNotes(updatedNotes);
            setEditingIndex(null); // Exit editing mode
        } else {
            // Add new note (prepended)
            setNotes([{ title: title.trim(), content: content.trim(), date: new Date().toLocaleString() }, ...notes]);
        }

        // Reset input fields
        setTitle('');
        setContent('');
    };

    const handleDelete = (index) => {
        // LOGIC VERIFIED: Core delete logic is maintained.
        const updatedNotes = notes.filter((_, i) => i !== index);
        setNotes(updatedNotes);
        // If we delete the currently edited note, clear the input
        if (editingIndex === index) {
            setTitle('');
            setContent('');
            setEditingIndex(null);
        }
    };

    const handleEdit = (index) => {
        // LOGIC VERIFIED: Core edit logic is maintained.
        const note = notes[index];
        setTitle(note.title);
        setContent(note.content);
        setEditingIndex(index);
    };
    
    // NEW FUNCTION: Cancel Edit
    const handleCancelEdit = () => {
        setTitle('');
        setContent('');
        setEditingIndex(null);
    }

    const handleShare = (note) => {
        const shareData = {
            title: note.title || 'Shared Note from ConvoSpace',
            text: `Note Title: ${note.title || 'Untitled Note'}\n---\n${note.content}\n\nShared on: ${note.date}`,
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('Note shared successfully'))
                .catch((error) => console.error('Error sharing note:', error));
        } else {
            const shareText = `${shareData.title}\n\n${shareData.text}`;
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    console.log('Note content copied to clipboard (Web Share API not available).');
                })
                .catch(err => console.error('Could not copy text: ', err));
        }
    };

    // Welcome Screen/Placeholder
    const WelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8" style={{ color: SECONDARY_TEXT }}>
            <NotebookPen size={48} style={{ color: PRIMARY_COLOR }} className="mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: PRIMARY_TEXT }}>
                Capture Insights Instantly
            </h3>
            <p className="text-sm">
                Use the form above to save key decisions, action items, and ideas during your meeting.
            </p>
        </div>
    );


    return (
        <div 
            className="w-full h-full flex flex-col rounded-xl overflow-hidden" 
            style={{
                minHeight: '40vh',
                backgroundColor: ELEVATED_BG, 
                color: PRIMARY_TEXT,
                boxShadow: DESIGN_TOKENS.shadows.lg, 
                borderRadius: DESIGN_TOKENS.radius.xl 
            }}
        >
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between"
                style={{ 
                    backgroundColor: SURFACE_BG, 
                    borderBottom: `1px solid ${BORDER_COLOR}`,
                    boxShadow: DESIGN_TOKENS.shadows.sm,
                }}
            >
                <div className="flex items-center">
                    <NotebookPen size={20} style={{ color: PRIMARY_COLOR }} className="mr-3" />
                    <span className="text-lg font-semibold" style={{ color: PRIMARY_TEXT }}>Meeting Notes</span>
                </div>
                <span className="text-sm font-medium" style={{ color: SECONDARY_TEXT }}>
                    Room: {room}
                </span>
            </div>

            {/* Note Input Area */}
            <div
                className="p-4"
                style={{ backgroundColor: SURFACE_BG }}
            >
                <input
                    type="text"
                    placeholder="Note Title (Optional)..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 mb-3 rounded-md border focus:ring-1 focus:ring-opacity-70 focus:outline-none"
                    style={{
                        borderColor: BORDER_COLOR,
                        color: PRIMARY_TEXT,
                        '--tw-ring-color': PRIMARY_COLOR,
                        backgroundColor: ELEVATED_BG,
                        boxShadow: DESIGN_TOKENS.shadows.sm,
                    }}
                />
                <textarea
                    rows="3"
                    placeholder="Write your note content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 rounded-md border resize-none focus:ring-1 focus:ring-opacity-70 focus:outline-none"
                    style={{
                        borderColor: BORDER_COLOR,
                        color: PRIMARY_TEXT,
                        '--tw-ring-color': PRIMARY_COLOR,
                        backgroundColor: ELEVATED_BG,
                        boxShadow: DESIGN_TOKENS.shadows.sm,
                    }}
                />
                
                <div className="flex justify-between items-center mt-3">
                    <button
                        onClick={handleSaveNote}
                        disabled={!title.trim() && !content.trim()}
                        className="flex-1 mr-2 px-6 py-2 rounded-full text-base font-semibold transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                        style={{
                            background: ACCENT_GRADIENT,
                            color: DESIGN_TOKENS.colors.text.white,
                            boxShadow: DESIGN_TOKENS.shadows.md,
                        }}
                    >
                        {editingIndex !== null ? <><Edit2 size={16} className="inline-block mr-2" /> Update Note</> : <><PlusCircle size={16} className="inline-block mr-2" /> Save Note</>}
                    </button>
                    
                    {/* CANCEL EDIT BUTTON (Fix applied here) */}
                    {editingIndex !== null && (
                         <button
                            onClick={handleCancelEdit} // Use the new dedicated handler
                            className="px-4 py-2 rounded-full text-sm font-medium transition-transform duration-200 hover:scale-[1.03] active:scale-[0.99]"
                            style={{
                                backgroundColor: HIGHLIGHT_BG,
                                color: PRIMARY_TEXT,
                                boxShadow: DESIGN_TOKENS.shadows.sm
                            }}
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Notes List Container */}
            <div
                className="p-4 flex-1 overflow-y-auto"
                style={{ backgroundColor: ELEVATED_BG }}
            >
                {notes.length === 0 ? (
                    <WelcomeScreen />
                ) : (
                    <ul className="space-y-3">
                        {notes.map((note, index) => (
                            <li
                                key={index}
                                // Individual note card style
                                className="p-4 rounded-lg shadow-md transition-all duration-150 hover:shadow-lg hover:translate-y-[-1px]"
                                style={{ 
                                    backgroundColor: SURFACE_BG, 
                                    borderLeft: `5px solid ${PRIMARY_COLOR}`,
                                    // Highlight if currently editing this note
                                    boxShadow: editingIndex === index ? `0 0 0 2px ${PRIMARY_COLOR}` : DESIGN_TOKENS.shadows.md
                                }}
                            >
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-base mb-1" style={{ color: PRIMARY_TEXT }}>
                                            {note.title || 'Untitled Note'}
                                        </h3>
                                        <p className="text-xs ml-4" style={{ color: SECONDARY_TEXT }}>{note.date.split(',')[0]}</p>
                                    </div>

                                    <p className="text-sm break-words whitespace-pre-wrap mt-1 mb-3" style={{ color: SECONDARY_TEXT }}>{note.content}</p>

                                    <div className="flex space-x-2 pt-2 border-t" style={{ borderColor: BORDER_COLOR }}>
                                        
                                        {/* SHARE BUTTON */}
                                        <button
                                            onClick={() => handleShare(note)}
                                            className="text-xs font-medium py-1 px-3 rounded-full transition-colors hover:bg-green-500 hover:text-white"
                                            style={{ border: `1px solid ${DESIGN_TOKENS.colors.success}`, color: DESIGN_TOKENS.colors.success }}
                                        >
                                            <Share2 size={14} className="inline-block mr-1 relative -top-px" /> Share
                                        </button>

                                        {/* EDIT BUTTON */}
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="text-xs font-medium py-1 px-3 rounded-full transition-colors hover:bg-blue-500 hover:text-white"
                                            style={{ border: `1px solid ${PRIMARY_COLOR}`, color: PRIMARY_COLOR }}
                                        >
                                            <Edit2 size={14} className="inline-block mr-1 relative -top-px" /> Edit
                                        </button>

                                        {/* DELETE BUTTON */}
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="text-xs font-medium py-1 px-3 rounded-full text-white transition-colors bg-red-500 hover:bg-red-600"
                                            style={{ backgroundColor: DESIGN_TOKENS.colors.delete }}
                                        >
                                            <Trash2 size={14} className="inline-block mr-1 relative -top-px" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Notepad;