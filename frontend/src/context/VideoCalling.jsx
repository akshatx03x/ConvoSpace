import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './SocketProvider';
import peer from '../services/Peer.js';

const THEME_LIGHT_BG = '#eed9de';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_HOVER_COLOR = '#b87c8a';
const THEME_TEXT_COLOR = '#333333';

const VideoCalling = () => {
    const [room, setRoom] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const socket = useSocket();

    // Handle join form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const email = user?.email;

        if (room) {
            socket.emit('room:join', { email, room });
            console.log(`Attempting to join room: ${room}`);
        }
    }

    // Current user successfully joins the room
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

    // Another user joins the room
    const handleUserJoined = useCallback((data) => {
        const { email, id } = data;
        setRemoteSocketId(id);
        console.log(`User ${email} joined the room with socket id: ${id}`);
    }, []);

    useEffect(() => {
        socket.on('user:join', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeeded);
        return () => {
            socket.off('user:join', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeedIncoming);

        }
    }, [socket, handleUserJoined]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMyStream(stream);
        console.log(`Incoming call from ${from} with offer:`, offer);
        const answer = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, answer });
        setRemoteSocketId(from);
    }, [socket]);

    const handleCallUser = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const offer = await peer.getOffer();
            socket.emit('user:call', { to: remoteSocketId, offer });
            setMyStream(stream);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error accessing webcam: ", err);
        }
    }, [remoteSocketId]);

    const handleCallAccepted = useCallback(async ({ from, answer }) => {
        peer.setLocalDescription(answer);
        console.log(`Call accepted by ${from} with answer:`, answer);
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, []);

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream);
        }, []);
    });
    const handleNegoNeeded = useCallback(async () => {
            const offer = await peer.getOffer();
            socket.emit('peer:nego:needed', { to: remoteSocketId, offer })
        }, [remoteSocketId]);

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded )
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
        }
}, []);


    if (isJoined) {
        return (
            <div
                className={`w-2/3 h-1/2 m-8 p-2 flex flex-col rounded-xl shadow-2xl`}
                style={{ backgroundColor: THEME_LIGHT_BG }}
            >
                <h2 className='text-2xl ml-5 font-extrabold tracking-wide' style={{ color: THEME_TEXT_COLOR }}>
                    You are in room: <span className="text-gray-700">{room}</span>
                </h2>
                <h4>{remoteSocketId ? 'Connected' : 'No one available'}</h4>

                {remoteSocketId && (
                    <button onClick={handleCallUser} className='p-2 bg-green-500 text-white rounded-lg m-2'>
                        Start Call
                    </button>
                )}

                <div className="flex flex-row m-2 w-full justify-around items-center">
                    {/* Local Video */}
                    <div className="flex flex-col items-center">
                        <h4 className="mb-2">You</h4>
                        <video
                            ref={localVideoRef}
                            url={myStream}
                            autoPlay
                            muted
                            playsInline
                            className="w-[400px] h-[300px] rounded-lg bg-black"
                        />
                    </div>

                    {/* Remote Video Placeholder */}
                    <div className="flex flex-col items-center">
                        <h4 className="mb-2">Remote</h4>
                        <video
                            ref={remoteVideoRef}
                            url={remoteStream}
                            autoPlay
                            playsInline
                            className="w-[400px] h-[300px] rounded-lg bg-gray-300"
                        />
                    </div>
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
                <form onSubmit={handleSubmit} className='flex flex-col justify-center font-semibold'>
                    <label
                        className='text-5xl m-1 flex justify-center font-extrabold tracking-tighter'
                        style={{ color: THEME_TEXT_COLOR }}
                        htmlFor="room"
                    >
                        Join Video Room
                    </label>
                    <input
                        className='rounded-full p-3 font-medium border-gray-300 border focus:border-opacity-70 focus:ring-2 focus:ring-offset-2 outline-none transition duration-300 shadow-inner'
                        style={{ borderColor: THEME_ACCENT_COLOR + '60' }}
                        placeholder='Enter Unique Id to Join'
                        type="text"
                        id='room'
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
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
