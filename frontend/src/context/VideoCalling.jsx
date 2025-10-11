import React, { useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketProvider';

const THEME_LIGHT_BG = '#eed9de';
const THEME_ACCENT_COLOR = '#A06C78'; 
const THEME_HOVER_COLOR = '#b87c8a'; 
const THEME_TEXT_COLOR = '#333333'; 

const VideoCalling = () => {
    const [room, setRoom] = useState("");
    const [isJoined, setIsJoined] = useState(false); 
    
    const socket = useSocket();
    const handleSubmit = (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const email = user?.email;
        
        if (room) {
            socket.emit('room:join', { email, room });
            console.log(`Attempting to join room: ${room}`);
        }
    }
    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        console.log(`Successfully joined room: ${room} with email: ${email}`);
        setIsJoined(true);
    }, []);

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        
        return () => {
            socket.off('room:join', handleJoinRoom);
        }
    }, [socket, handleJoinRoom]);

    if (isJoined) {
        return (
            <div 
                className={`w-2/3 h-1/2 m-8 p-2 flex flex-col rounded-xl shadow-2xl`} 
                style={{ backgroundColor: THEME_LIGHT_BG }}
            >
                <h2 className='text-2xl ml-5 font-extrabold tracking-wide' style={{ color: THEME_TEXT_COLOR }}>
                    You are in room: <span className="text-gray-700">{room}</span>
                </h2>
                <div className="flex-grow m-2 w-[950px] h-[450px] flex items-center justify-center text-xl bg-white border-2 border-dashed border-gray-300 rounded-xl font-semibold text-gray-500 shadow-inner">
                    <span className='font-serif text-xl'>[Your Video Calling Interface Goes Here]</span>
                </div>
                <div className="flex justify-center p-2">
                    <button 
                        className="px-6 py-2 mx-2 text-white font-semibold rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                        style={{ backgroundColor: THEME_ACCENT_COLOR, filter: 'brightness(90%)' }} 
                    >
                        Controls
                    </button>
                    <button 
                        className="px-6 py-2 mx-2 bg-red-500 text-white font-semibold rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                    >
                        Leave
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`w-2/3 h-1/2 m-8 rounded-[40px] p-20 flex flex-col justify-center shadow-2xl`}
            style={{ backgroundColor: THEME_LIGHT_BG }}
        >
            <div className="p-10 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/70 shadow-xl">
                <form onSubmit={handleSubmit} className='flex flex-col justify-center font-semibold' action="">
                    <label 
                        className='text-5xl m-1 flex justify-center font-extrabold tracking-tighter' 
                        style={{ color: THEME_TEXT_COLOR }} 
                        htmlFor="room"
                    >
                        Join Video Room
                    </label>
                    <br />
                    <input 
                        className='rounded-full p-3 font-medium border-gray-300 border focus:border-opacity-70 focus:ring-2 focus:ring-offset-2 outline-none transition duration-300 shadow-inner' 
                        style={{ borderColor: THEME_ACCENT_COLOR + '60', focusRingColor: THEME_ACCENT_COLOR }}
                        placeholder='Enter Unique Id to Join'
                        type="text" 
                        id='room' 
                        value={room} 
                        onChange={(e) => setRoom(e.target.value)} 
                    />
                    <br/>
                    <button 
                        className='text-white rounded-full m-1 w-1/3 p-3 font-extrabold self-center disabled:opacity-50 disabled:cursor-not-allowed transition duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.03]' 
                        style={{ backgroundColor: THEME_ACCENT_COLOR }} 
                        type="submit"
                        disabled={!room}
                    >
                        Connect Now
                    </button>
                </form>
            </div>
        </div>
    )
}

export default VideoCalling;