import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketProvider';

// 🎨 Theme Colors
const THEME_LIGHT_BG = '#f4f4f9';
const THEME_CARD_BG = '#ffffff';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';
const THEME_SIDEBAR_ACCENT = '#3d3d78';
const THEME_CALENDAR_ORANGE = '#f66a4f';

const VideoCalling = () => {
    const [room, setRoom] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [user, setUser] = useState(null); // 🧩 User state for email display
    
    const socket = useSocket();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) setUser(storedUser);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const email = user?.email;

        if (room) {
            socket.emit('room:join', { email, room });
        }
    };

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        setIsJoined(true);
    }, []);

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);

        return () => {
            socket.off('room:join', handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);

    // ✅ If user has joined room
    if (isJoined) {
        return (
            <div
                className="w-full h-screen p-6 flex flex-col items-center justify-center"
                style={{ backgroundColor: THEME_LIGHT_BG }}
            >
                <div
                    className="w-full max-w-4xl p-8 rounded-3xl shadow-2xl flex flex-col items-center"
                    style={{ backgroundColor: THEME_CARD_BG }}
                >
                    <h2 className="text-3xl font-extrabold mb-6" style={{ color: THEME_TEXT_COLOR }}>
                        You are in room: <span className="text-gray-700">{room}</span>
                    </h2>
                    <div className="w-full h-96 flex items-center justify-center text-xl bg-gray-100 rounded-2xl border border-dashed border-gray-300 font-semibold text-gray-500 shadow-inner mb-6">
                        <span className="font-serif text-2xl">[Video Call Interface Live]</span>
                    </div>
                    <div className="flex justify-center p-2">
                        <button
                            className="px-8 py-3 mx-2 text-white font-bold rounded-xl shadow-lg transition duration-300 hover:opacity-90"
                            style={{ backgroundColor: THEME_ACCENT_COLOR }}
                        >
                            🎙️ Mute / 📹 Toggle
                        </button>
                        <button
                            className="px-8 py-3 mx-2 bg-red-500 text-white font-bold rounded-xl shadow-lg transition duration-300 hover:bg-red-600"
                        >
                            📞 End Call
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Default Dashboard UI (before joining)
    return (
        <div
            className="flex w-full min-h-screen p-6"
            style={{ backgroundColor: THEME_LIGHT_BG }}
        >
            <div
                className="flex w-full rounded-[40px] shadow-2xl overflow-hidden"
                style={{
                    backgroundColor: THEME_CARD_BG,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                }}
            >
                {/* 🧭 Sidebar */}
                <div
                    className="w-1/5 min-w-[250px] p-8 flex flex-col justify-start items-center"
                    style={{ borderRight: '1px solid #f0f0f5' }}
                >
                    <div className="flex items-center w-full mb-10">
                        <div className="w-6 h-6 mr-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xl font-extrabold" style={{ color: THEME_TEXT_COLOR }}>
                            Chaart
                        </span>
                    </div>

                    {/* 👤 User Info */}
                    <div className="flex flex-col items-center mb-10">
                        <img
                            src="https://via.placeholder.com/150/a06c78/ffffff?text=U"
                            alt="User Profile"
                            className="w-20 h-20 rounded-full object-cover mb-3 shadow-md"
                        />
                        <p
                            className="font-semibold text-lg"
                            style={{ color: THEME_TEXT_COLOR }}
                        >
                            {user?.name || "Guest User"}
                        </p>
                        <p className="text-sm text-gray-500 break-words text-center max-w-[180px]">
                            {user?.email || "guest@example.com"}
                        </p>
                    </div>

                    {/* 🧭 Navigation */}
                    <nav className="w-full space-y-3 font-medium text-gray-600">
                        {['Dashboard', 'Analytics', 'Task List', 'Tracking'].map((item, index) => (
                            <div
                                key={item}
                                className={`flex items-center p-3 rounded-xl transition duration-200 cursor-pointer ${
                                    index === 0 ? 'shadow-lg' : 'hover:bg-gray-100'
                                }`}
                                style={
                                    index === 0
                                        ? {
                                              backgroundColor: THEME_ACCENT_COLOR + '10',
                                              color: THEME_SIDEBAR_ACCENT,
                                          }
                                        : {}
                                }
                            >
                                <span className="mr-3">{index === 0 ? '🏠' : '📝'}</span>
                                {item}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* 🧩 Main Content */}
                <div className="flex-grow p-12 flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h1 className="text-3xl font-bold" style={{ color: THEME_TEXT_COLOR }}>
                            Hello, {user?.name || "Guest"}
                            <span className="block text-sm font-medium text-gray-500">
                                Today is Monday, 20 October 2025
                            </span>
                        </h1>
                        <button
                            className="px-6 py-2 text-white rounded-xl font-semibold shadow-lg transition duration-300 hover:opacity-90"
                            style={{ backgroundColor: THEME_CALENDAR_ORANGE }}
                        >
                            + Start New Meeting
                        </button>
                    </div>

                    {/* 🔗 Join Room Form */}
                    <div
                        className="w-full max-w-lg p-10 rounded-3xl shadow-xl flex flex-col justify-center"
                        style={{ backgroundColor: '#f0f0f5', border: '1px solid #e0e0e0' }}
                    >
                        <form onSubmit={handleSubmit} className="flex flex-col font-semibold">
                            <label
                                className="text-3xl m-1 mb-6 flex justify-center font-extrabold tracking-tight"
                                style={{ color: THEME_TEXT_COLOR }}
                                htmlFor="room"
                            >
                                🔗 Join Video Room
                            </label>

                            <input
                                className="rounded-xl p-4 mb-6 font-medium border-2 border-gray-200 focus:ring-4 focus:ring-opacity-20 outline-none transition duration-300 placeholder-gray-400 shadow-inner"
                                style={{
                                    borderColor: THEME_ACCENT_COLOR + '60',
                                    focusRingColor: THEME_ACCENT_COLOR,
                                }}
                                placeholder="Enter a unique Room ID"
                                type="text"
                                id="room"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                            />

                            <button
                                className="text-white rounded-xl m-1 mt-4 w-full p-4 font-extrabold self-center disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.01]"
                                style={{ backgroundColor: THEME_ACCENT_COLOR }}
                                type="submit"
                                disabled={!room}
                            >
                                Connect Now
                            </button>
                        </form>
                    </div>

                    {/* 🗂 Extra Dashboard Cards */}
                    <div className="flex space-x-6 mt-8">
                        <div className="w-1/3 h-32 rounded-2xl bg-purple-100 shadow-lg border border-purple-200/50 flex items-center justify-center text-sm text-purple-800 font-bold">
                            Web Development Tasks
                        </div>
                        <div className="w-1/3 h-32 rounded-2xl bg-blue-100 shadow-lg border border-blue-200/50 flex items-center justify-center text-sm text-blue-800 font-bold">
                            Mobile App Design
                        </div>
                    </div>
                </div>

                {/* 📅 Calendar Panel */}
                <div
                    className="w-1/4 min-w-[280px] p-8"
                    style={{ borderLeft: '1px solid #f0f0f5' }}
                >
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold" style={{ color: THEME_TEXT_COLOR }}>
                            Calendar
                        </h3>
                        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
                            🔔
                        </span>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-gray-700">Oct 20, 2025</p>
                        <div className="space-y-3 text-sm">
                            <div className="flex border-l-4 border-purple-500 pl-3">
                                <span className="font-bold mr-3">10:00</span>
                                <p>Dribbble shot</p>
                            </div>
                            <div className="flex border-l-4 border-blue-500 pl-3">
                                <span className="font-bold mr-3">13:20</span>
                                <p>Task Management</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-700 mt-6">Oct 21, 2025</p>
                        <div className="space-y-3 text-sm">
                            <div className="flex border-l-4 border-orange-500 pl-3">
                                <span className="font-bold mr-3">10:00</span>
                                <p>UX Research</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCalling;
