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
    const [error, setError] = useState(null);

    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const socket = useSocket();
    const myStreamRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const email = user?.email;
        if (room) {
            socket.emit('room:join', { email, room });
            console.log(`Attempting to join room: ${room}`);
        }
    };

    const handleJoinRoom = useCallback((data) => {
        const { email, room } = data;
        console.log(`Joined room: ${room} with email: ${email}`);
        setIsJoined(true);
    }, []);

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () => {
            socket.off('room:join', handleJoinRoom);
        };
    }, [socket, handleJoinRoom]);

    const handleUserJoined = useCallback((data) => {
        const { email, id } = data;
        setRemoteSocketId(id);
        console.log(`User ${email} joined with socket id: ${id}`);
    }, []);

    useEffect(() => {
        if (isJoined && !myStream) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setMyStream(stream);
                    myStreamRef.current = stream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = stream;
                    }
                })
                .catch((err) => {
                    console.error("Error accessing camera/mic:", err);
                    setError("Camera/microphone not accessible.");
                });
        }
    }, [isJoined, myStream]);

    const handleIncomingCall = useCallback(async ({ from, offer }) => {
        console.log(`Incoming call from ${from}`);
        setRemoteSocketId(from);

        try {
            let stream = myStreamRef.current;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setMyStream(stream);
                myStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            }

            const answer = await peer.getAnswer(offer);
            socket.emit('call:accepted', { to: from, answer });

            for (const track of stream.getTracks()) {
                peer.peer.addTrack(track, stream);
            }

        } catch (err) {
            console.error("Incoming call error:", err);
            setError("Camera/microphone not available.");
        }
    }, [socket]);

    const handleCallUser = useCallback(async () => {
        try {
            let stream = myStreamRef.current;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setMyStream(stream);
                myStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            }

            const offer = await peer.getOffer();
            socket.emit('user:call', { to: remoteSocketId, offer });

            for (const track of stream.getTracks()) {
                peer.peer.addTrack(track, stream);
            }

        } catch (err) {
            console.error("Error calling user:", err);
            setError("Camera/microphone not available.");
        }
    }, [remoteSocketId, socket]);

    const handleCallAccepted = useCallback(async ({ from, answer }) => {
        await peer.setRemoteDescription(answer);
        console.log(`Call accepted by ${from}`);
    }, []);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { to: remoteSocketId, offer });
    }, [remoteSocketId, socket]);

    const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.getAnswer();
        socket.emit('peer:nego:done', { to: from, answer });
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({ from, answer }) => {
        await peer.setRemoteDescription(answer);
    }, []);

    useEffect(() => {
        socket.on('user:join', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeedIncoming);
        socket.on('peer:nego:final', handleNegoNeedFinal);

        return () => {
            socket.off('user:join', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeedIncoming);
            socket.off('peer:nego:final', handleNegoNeedFinal);
        };
    }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);

    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams;
            console.log('Received remote stream:', remoteStream);
            setRemoteStream(remoteStream[0]);
        });

        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);

        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const handleLeaveMeeting = useCallback(() => {
        if (myStreamRef.current) {
            myStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (peer.peer) {
            peer.peer.close();
        }

        socket.emit('room:leave', { room });

        setIsJoined(false);
        setRemoteSocketId(null);
        setMyStream(null);
        myStreamRef.current = null;
        setRemoteStream(null);
        setRoom("");
        setError(null);

        console.log('Left the meeting and cut the call');
    }, [socket, room]);

    if (isJoined) {
        return (
            <div className="w-2/3 h-1/2 m-8 p-2 flex flex-col rounded-xl shadow-2xl" style={{ backgroundColor: THEME_LIGHT_BG }}>
                <h2 className="text-2xl ml-5 font-extrabold tracking-wide" style={{ color: THEME_TEXT_COLOR }}>
                    You are in room: <span className="text-gray-700">{room}</span>
                </h2>
                <h4>{remoteSocketId ? 'Connected' : 'Waiting for someone to join...'}</h4>

                {error && <p className="text-red-500 text-center">{error}</p>}

                {remoteSocketId && (
                    <button onClick={handleCallUser} className="p-2 bg-green-500 text-white rounded-lg m-2">
                        Start Call
                    </button>
                )}

                <div className="flex flex-row m-2 w-full justify-around items-center">
                    <div className="flex flex-col items-center">
                        <h4 className="mb-2">You</h4>
                        <video ref={localVideoRef} autoPlay muted playsInline className="w-[400px] h-[300px] rounded-lg bg-black" />
                    </div>

                    <div className="flex flex-col items-center">
                        <h4 className="mb-2">Remote</h4>
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-[400px] h-[300px] rounded-lg bg-gray-300" />
                    </div>
                </div>

                <div className="flex justify-center p-2">
                    <button
                        className="px-6 py-2 mx-2 text-white font-semibold rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                        style={{ backgroundColor: THEME_ACCENT_COLOR }}
                    >
                        Controls
                    </button>
                    <button
                        onClick={handleLeaveMeeting}
                        className="px-6 py-2 mx-2 bg-red-500 text-white font-semibold rounded-full shadow-lg transition duration-300 transform hover:scale-105"
                    >
                        Leave
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-2/3 h-1/2 m-8 rounded-[40px] p-20 flex flex-col justify-center shadow-2xl" style={{ backgroundColor: THEME_LIGHT_BG }}>
            <div className="p-10 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/70 shadow-xl">
                <form onSubmit={handleSubmit} className="flex flex-col justify-center font-semibold">
                    <label className="text-5xl m-1 flex justify-center font-extrabold tracking-tighter" style={{ color: THEME_TEXT_COLOR }}>
                        Join Video Room
                    </label>
                    <input
                        className="rounded-full p-3 font-medium border-gray-300 border focus:ring-2 focus:ring-offset-2 outline-none transition duration-300 shadow-inner"
                        style={{ borderColor: THEME_ACCENT_COLOR + '60' }}
                        placeholder="Enter Unique Id to Join"
                        type="text"
                        id="room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                    />
                    <button
                        className="text-white rounded-full m-1 w-1/3 p-3 font-extrabold self-center transition duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.03]"
                        style={{ backgroundColor: THEME_ACCENT_COLOR }}
                        type="submit"
                        disabled={!room}
                    >
                        Connect Now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VideoCalling;
