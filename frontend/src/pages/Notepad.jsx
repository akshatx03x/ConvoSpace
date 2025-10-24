import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketProvider';

// Theme Constants derived from the FileUploader component
const THEME_LIGHT_CARD_BG = '#F0EBEA';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';

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
        if (!title.trim() && !content.trim()) return;

        if (editingIndex !== null) {
            // Update existing note
            const updatedNotes = [...notes];
            updatedNotes[editingIndex] = { title, content, date: new Date().toLocaleString() };
            setNotes(updatedNotes);
            setEditingIndex(null);
        } else {
            // Add new note (prepended)
            setNotes([{ title, content, date: new Date().toLocaleString() }, ...notes]);
        }

        // Reset input fields
        setTitle('');
        setContent('');
    };

    const handleDelete = (index) => {
        const updatedNotes = notes.filter((_, i) => i !== index);
        setNotes(updatedNotes);
    };

    const handleEdit = (index) => {
        const note = notes[index];
        setTitle(note.title);
        setContent(note.content);
        setEditingIndex(index);
    };

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
            // Fallback for browsers that don't support the Web Share API
            const shareText = `${shareData.title}\n\n${shareData.text}`;
            // Simple clipboard copy as a fallback
            navigator.clipboard.writeText(shareText)
                .then(() => {
                    // This should be replaced with a custom UI notification instead of alert()
                    console.log('Note content copied to clipboard (Web Share API not available).');
                })
                .catch(err => console.error('Could not copy text: ', err));
        }
    };

    return (
        // Main container uses the light background color
        <div className="flex flex-col  h-full w-full p-4 font-sans overflow-y-auto rounded-xl shadow-xl overflow-hidden"
		style={{
			height: '590px', 
			backgroundColor: THEME_LIGHT_CARD_BG ,
			color: THEME_TEXT_COLOR,
		}}
        >
            {/* Primary Card Container - Consistent with FileUploader */}
            <div
                className="p-4 rounded-xl shadow-lg flex flex-col h-full max-w-lg w-full mx-auto"
                style={{ backgroundColor: 'white' }}
            >
                <h2
                    className="text-2xl font-bold mb-4 text-center"
                    style={{ color: THEME_ACCENT_COLOR }}
                >
                    My Notepad
                </h2>

                {/* Note Input Area Card - Uses light background and rounded-xl */}
                <div
                    className="p-4 rounded-xl shadow-md mb-4"
                    style={{ backgroundColor: THEME_LIGHT_CARD_BG }}
                >
                    <input
                        type="text"
                        placeholder="Note Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 mb-3 rounded-lg border focus:outline-none"
                        style={{
                            borderColor: THEME_ACCENT_COLOR + '60',
                            color: THEME_TEXT_COLOR,
                        }}
                    />
                    <textarea
                        rows="4"
                        placeholder="Write your note..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 rounded-lg border resize-none focus:outline-none"
                        style={{
                            borderColor: THEME_ACCENT_COLOR + '60',
                            color: THEME_TEXT_COLOR,
                        }}
                    />
                    {/* Consistent Button Style: rounded-full, shadow-lg, accent color */}
                    <button
                        onClick={handleSaveNote}
                        className="mt-4 w-full px-6 py-2 rounded-full text-base font-medium shadow-lg transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
                        style={{
                            backgroundColor: THEME_ACCENT_COLOR,
                            color: 'white',
                        }}
                    >
                        {editingIndex !== null ? 'Update Note' : 'Save New Note'}
                    </button>
                </div>

                {/* Notes List Container - Uses light background and rounded-xl */}
                <div
                    className="p-4  rounded-xl flex-1 overflow-y-auto shadow-inner"
                    style={{ backgroundColor: THEME_LIGHT_CARD_BG, color: THEME_TEXT_COLOR }}
                >
                    <p className="font-semibold mb-3 text-lg" style={{ color: THEME_ACCENT_COLOR }}>
                        Saved Notes:
                    </p>
                    {notes.length === 0 ? (
                        <p className="opacity-70 text-sm italic">No notes saved yet. Start writing above!</p>
                    ) : (
                        <ul className="space-y-4">
                            {notes.map((note, index) => (
                                <li
                                    key={index}
                                    // Individual note card style
                                    className="p-4 rounded-xl shadow-md transition-all duration-150 hover:shadow-lg hover:scale-[1.01]"
                                    style={{ backgroundColor: 'white', borderLeft: `5px solid ${THEME_ACCENT_COLOR}` }}
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg mb-1" style={{ color: THEME_ACCENT_COLOR }}>
                                                {note.title || 'Untitled Note'}
                                            </h3>
                                            <p className="text-sm break-words whitespace-pre-wrap">{note.content}</p>
                                            <p className="text-xs opacity-70 mt-2">{note.date}</p>
                                        </div>
                                        <div className="flex space-x-3 mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                                            
                                            {/* --- NEW SHARE BUTTON --- */}
                                            <button
                                                onClick={() => handleShare(note)}
                                                className="text-xs font-medium py-1 px-3 rounded-full border transition-colors hover:bg-green-500 hover:text-white"
                                                style={{ borderColor: '#4CAF50', color: '#4CAF50' }} // Green theme for share
                                            >
                                                Share
                                            </button>
                                            {/* --- END NEW SHARE BUTTON --- */}

                                            <button
                                                onClick={() => handleEdit(index)}
                                                className="text-xs font-medium py-1 px-3 rounded-full border transition-colors hover:bg-gray-100"
                                                style={{ borderColor: THEME_ACCENT_COLOR, color: THEME_ACCENT_COLOR }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(index)}
                                                className="text-xs font-medium py-1 px-3 rounded-full text-white transition-colors bg-red-500 hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notepad;
