// VideoCalling.jsx (COMPLETE FIX - Socket Ready Check)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from './SocketProvider';
import peer from '../services/Peer.js';
import GeminiChatUI from '../pages/GeminiUi.jsx';
import FeatureCard from '../components/Extras/FeatureCard.jsx';
import QuotesTicker from '../components/Extras/Quotes.jsx';
import About from '../components/Extras/About.jsx';
import Footer from '../components/Extras/Footer.jsx';
import FileUploader from '../pages/FileUploader.jsx';
import Notepad from '../pages/Notepad.jsx';
import Chats from '../pages/Chats.jsx';

const THEME_MAIN_BG = '#c3a6a0';
const THEME_LIGHT_CARD_BG = '#F0EBEA';
const THEME_ACCENT_COLOR = '#A06C78';
const THEME_TEXT_COLOR = '#333333';
const GRADIENT_BG_DASHBOARD = 'linear-gradient(to right bottom, #E0C0C0, #EAE0E0, #a06c78)';
const GRADIENT_BG_JOIN = 'linear-gradient(to top right, #E0C0C0, #D5B0B0, #a06c78)';
const NAVBAR_HEIGHT = '80px';

const VideoCalling = () => {
  const [room, setRoom] = useState("");
  const [joinRoom, setJoinRoom] = useState("");
  const [generatedRoom, setGeneratedRoom] = useState("");
  const [lastGenerated, setLastGenerated] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [myStream, setMyStream] = useState(null);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [joinError, setJoinError] = useState("");
  const [mediaStarted, setMediaStarted] = useState(false);

  const localVideoRef = useRef();
  const socket = useSocket();
  const myStreamRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());

  const generateRoomCode = () => {
    let code;
    do {
      code = Math.random().toString(16).substring(2, 7).toUpperCase();
    } while (code === lastGenerated);
    setLastGenerated(code);
    setGeneratedRoom(code);
    setRoom(code);
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!socket) {
      setJoinError("Connection not ready. Please wait...");
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user?.email;
    if (generatedRoom) {
      console.log('Creating room:', generatedRoom);
      socket.emit('room:join', { email, room: generatedRoom });
    }
  };

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();
    if (!socket) {
      setJoinError("Connection not ready. Please wait...");
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user?.email;
    if (joinRoom) {
      if (/^[A-F0-9]{5}$/.test(joinRoom.toUpperCase())) {
        console.log('Joining room:', joinRoom.toUpperCase());
        setRoom(joinRoom.toUpperCase());
        socket.emit('room:join', { email, room: joinRoom.toUpperCase() });
      } else {
        setJoinError("Enter a valid 5-character room code.");
      }
    }
  };

  const handleJoinRoom = useCallback((data) => {
    const { room } = data;
    console.log('✅ Joined room:', room);
    setRoom(room);
    setIsJoined(true);
    setJoinError("");
  }, []);

  const handleJoinRoomError = useCallback((data) => {
    const { message } = data;
    console.error('❌ Join error:', message);
    setJoinError(message || "Unable to join room.");
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('room:join', handleJoinRoom);
    socket.on('room:join:error', handleJoinRoomError);
    
    return () => {
      socket.off('room:join', handleJoinRoom);
      socket.off('room:join:error', handleJoinRoomError);
    };
  }, [socket, handleJoinRoom, handleJoinRoomError]);

  // Get local media when joined
  useEffect(() => {
    if (isJoined && !myStream && !mediaStarted) {
      console.log('🎥 Getting local media...');
      navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      })
        .then((stream) => {
          console.log('✅ Got local stream');
          setMyStream(stream);
          myStreamRef.current = stream;
          setMediaStarted(true);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('❌ Media error:', err);
          setError("Camera/microphone not accessible.");
        });
    }
  }, [isJoined, myStream, mediaStarted]);

  const handleUserJoined = useCallback(async ({ email, id }) => {
    console.log('👤 User joined:', email, id);
    
    setRemoteUsers(prev => {
      if (prev.some(u => u.id === id)) return prev;
      return [...prev, { id, email, stream: null }];
    });

    if (!myStreamRef.current) {
      console.warn('⚠️ Local stream not ready');
      return;
    }

    console.log('📞 Creating peer for:', id);
    
    try {
      peer.createPeer(
        id,
        (remoteStream) => {
          console.log('✅ Remote stream from:', id);
          setRemoteUsers(prev => 
            prev.map(u => u.id === id ? { ...u, stream: remoteStream } : u)
          );
          
          const videoEl = remoteVideoRefs.current.get(id);
          if (videoEl) {
            videoEl.srcObject = remoteStream;
            videoEl.play().catch(e => console.error('Play error:', e));
          }
        },
        async () => {
          console.log('🔄 Renegotiation for:', id);
          try {
            const offer = await peer.getOffer(id);
            socket.emit('room:peer:nego:needed', { room, offer });
          } catch (err) {
            console.error('Renegotiation error:', err);
          }
        },
        (candidate) => {
          socket.emit('room:ice:candidate', { room, candidate, to: id });
        }
      );

      peer.addLocalStreamToPeer(id, myStreamRef.current);

      const offer = await peer.getOffer(id);
      socket.emit('room:call', { room, offer });
      console.log('📤 Offer sent to:', id);
    } catch (err) {
      console.error('❌ Error creating peer:', err);
    }
  }, [socket, room]);

  const handleUserLeft = useCallback((data) => {
    const { id } = data;
    console.log('👋 User left:', id);
    peer.removePeer(id);
    remoteVideoRefs.current.delete(id);
    setRemoteUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    console.log('📞 Incoming call from:', from);
    
    try {
      let stream = myStreamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
          audio: true 
        });
        setMyStream(stream);
        myStreamRef.current = stream;
        setMediaStarted(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      peer.createPeer(
        from,
        (remoteStream) => {
          console.log('✅ Remote stream from:', from);
          setRemoteUsers(prev => 
            prev.map(u => u.id === from ? { ...u, stream: remoteStream } : u)
          );
          
          const videoEl = remoteVideoRefs.current.get(from);
          if (videoEl) {
            videoEl.srcObject = remoteStream;
            videoEl.play().catch(e => console.error('Play error:', e));
          }
        },
        async () => {
          try {
            const offer = await peer.getOffer(from);
            socket.emit('room:peer:nego:needed', { room, offer });
          } catch (err) {
            console.error('Renegotiation error:', err);
          }
        },
        (candidate) => {
          socket.emit('room:ice:candidate', { room, candidate, to: from });
        }
      );

      peer.addLocalStreamToPeer(from, stream);

      const answer = await peer.getAnswer(from, offer);
      socket.emit('room:call:accepted', { room, answer });
      console.log('📤 Answer sent to:', from);
    } catch (err) {
      console.error('❌ Error handling call:', err);
    }
  }, [socket, room]);

  const handleCallAccepted = useCallback(async ({ from, answer }) => {
    console.log('✅ Call accepted by:', from);
    try {
      await peer.setRemoteDescription(from, answer);
    } catch (err) {
      console.error('❌ Error setting answer:', err);
    }
  }, []);

  const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
    console.log('🔄 Renegotiation from:', from);
    try {
      const answer = await peer.getAnswer(from, offer);
      socket.emit('room:peer:nego:done', { room, answer });
    } catch (err) {
      console.error('❌ Renegotiation error:', err);
    }
  }, [socket, room]);

  const handleNegoNeedFinal = useCallback(async ({ from, answer }) => {
    console.log('✅ Final renegotiation from:', from);
    try {
      await peer.setRemoteDescription(from, answer);
    } catch (err) {
      console.error('❌ Final renegotiation error:', err);
    }
  }, []);

  const handleIceCandidate = useCallback(async ({ candidate, from }) => {
    if (!candidate) return;
    console.log('📥 ICE from:', from);
    try {
      await peer.addIceCandidate(from, candidate);
    } catch (err) {
      console.warn('ICE error:', err.message);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('user:join', handleUserJoined);
    socket.on('user:left', handleUserLeft);
    socket.on('room:incoming:call', handleIncomingCall);
    socket.on('room:call:accepted', handleCallAccepted);
    socket.on('room:peer:nego:needed', handleNegoNeedIncoming);
    socket.on('room:peer:nego:final', handleNegoNeedFinal);
    socket.on('room:ice:candidate', handleIceCandidate);

    return () => {
      socket.off('user:join', handleUserJoined);
      socket.off('user:left', handleUserLeft);
      socket.off('room:incoming:call', handleIncomingCall);
      socket.off('room:call:accepted', handleCallAccepted);
      socket.off('room:peer:nego:needed', handleNegoNeedIncoming);
      socket.off('room:peer:nego:final', handleNegoNeedFinal);
      socket.off('room:ice:candidate', handleIceCandidate);
    };
  }, [socket, handleUserJoined, handleUserLeft, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal, handleIceCandidate]);

  // Debug peer states
  useEffect(() => {
    if (!isJoined) return;
    const interval = setInterval(() => {
      const states = peer.getAllPeerStates();
      if (Object.keys(states).length > 0) {
        console.log('🔍 Peer states:', states);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isJoined]);

  const toggleMic = useCallback(() => {
    if (myStreamRef.current) {
      myStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(prev => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (myStreamRef.current) {
      myStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(prev => !prev);
    }
  }, []);

  const handleLeaveMeeting = useCallback(async () => {
    console.log('👋 Leaving meeting');
    setIsJoined(false);
    try {
      if (myStreamRef.current) {
        myStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peer.closeAllPeers();
      remoteVideoRefs.current.clear();
      if (socket) {
        socket.emit('room:leave', { room });
      }
      setMyStream(null);
      myStreamRef.current = null;
      setRoom("");
      setError(null);
      setRemoteUsers([]);
      setMediaStarted(false);
      setRefreshKey(prev => prev + 1);
      localStorage.removeItem(`notes_${room}`);
    } catch (error) {
      console.error('❌ Error leaving:', error);
    }
  }, [socket, room]);

  // Show loading if socket not ready
  if (!socket) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: '#d9bdb8' }}>
        <div className="text-center">
          <div className="text-2xl font-bold mb-4" style={{ color: THEME_TEXT_COLOR }}>Connecting...</div>
          <div className="text-gray-600">Please wait while we establish connection</div>
        </div>
      </div>
    );
  }

  if (!isJoined) {
    return (
      <div className="w-full min-h-screen justify-start items-center p-5 rounded-2xl" style={{ backgroundColor: '#d9bdb8', height: `calc(100vh - ${NAVBAR_HEIGHT})`, marginTop: NAVBAR_HEIGHT }}>
        <div className='flex justify-center font-medium border-2 border-gray-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer w-2/3 mx-8 p-2 my-5 rounded-b-2xl' style={{backgroundColor:THEME_LIGHT_CARD_BG}}>"Collaborate seamlessly. Innovate effortlessly. Your work, connected." </div>
        <div className="w-2/3 h-[550px] rounded-2xl overflow-hidden flex m-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
          <div className="w-3/4 p-12 flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold mb-2" style={{ color: THEME_TEXT_COLOR }}>Hello Again!</h1>
            <p className="text-md text-gray-500 mb-8">Let's get started with your 30 days trial</p>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: THEME_TEXT_COLOR }}>Create Room-</h2>
              <button onClick={generateRoomCode} className="text-white rounded-xl p-4 font-extrabold shadow-xl hover:scale-[1.01] mb-4" style={{ backgroundColor: THEME_ACCENT_COLOR }}>Generate Room Code</button>
              {generatedRoom && (
                <div className="mb-4">
                  <p className="text-lg font-medium" style={{ color: THEME_TEXT_COLOR }}>Room Code: <span className="font-bold">{generatedRoom}</span></p>
                  <form onSubmit={handleCreateRoom} className="flex flex-col space-y-4">
                    <button className="text-white rounded-xl p-4 font-extrabold shadow-xl hover:scale-[1.01]" style={{ backgroundColor: THEME_ACCENT_COLOR }} type="submit">Start Meeting</button>
                  </form>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: THEME_TEXT_COLOR }}>Join Room-</h2>
              <form onSubmit={handleJoinRoomSubmit} className="flex flex-col space-y-4">
                <input className="rounded-xl p-4 font-medium border-2 focus:ring-2 shadow-inner" style={{ borderColor: THEME_ACCENT_COLOR + '60' }} placeholder="Enter Shared Room Code" value={joinRoom} onChange={(e) => setJoinRoom(e.target.value)} />
                <button className="text-white rounded-xl p-4 font-extrabold shadow-xl hover:scale-[1.01]" style={{ backgroundColor: THEME_ACCENT_COLOR }} type="submit" disabled={!joinRoom}>Join Meeting</button>
                {joinError && <p className="text-red-500 text-sm font-medium">{joinError}</p>}
              </form>
            </div>
          </div>
          <div className="w-1/2 flex flex-col justify-end p-10 rounded-2xl" style={{ background: GRADIENT_BG_JOIN }}>
            <p className="text-white text-right text-3xl font-light italic">"Connect, collaborate, and conquer."</p>
            <p className="text-white text-right text-lg font-bold mt-4">Your Advantage Awaits.</p>
          </div>
        </div>
        <QuotesTicker/>
        <FeatureCard/>
        <About/>
        <Footer/>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col w-full p-0 m-0 overflow-y-auto" style={{ backgroundColor: THEME_MAIN_BG, minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`, marginTop: NAVBAR_HEIGHT }}>
        <div className="flex w-30/31 p-4 gap-4 flex-shrink-0" style={{ height: '85vh', maxHeight: '85vh' }}>
          <div className="flex-1 flex justify-center items-center">
            <div className="flex w-full h-full rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
              <div className="w-1/6 flex flex-col justify-end p-6" style={{ background: GRADIENT_BG_DASHBOARD }}>
                <p className="text-white text-right font-bold text-2xl italic opacity-90">Finally, Get your Advantage.</p>
              </div>
              <div className="flex flex-col w-5/6 p-6 space-y-6 justify-between border-l border-gray-300">
                <h2 className="text-3xl font-extrabold" style={{ color: THEME_TEXT_COLOR }}>Room: <span className="text-gray-600 font-medium">{room}</span></h2>
                <div className="flex flex-row gap-4 justify-center flex-grow overflow-x-auto">
                  <div className="flex flex-col items-center p-3 bg-white/70 rounded-2xl shadow-xl flex-shrink-0 transition-all duration-500 ease-in-out" style={{ minWidth: '200px', maxWidth: '300px' }}>
                    <h4 className="mb-2 text-lg font-semibold" style={{ color: THEME_ACCENT_COLOR }}>You</h4>
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-2xl bg-black" />
                  </div>
                  {remoteUsers.map((user) => (
                    <div key={user.id} className="flex flex-col items-center p-3 bg-white/70 rounded-2xl shadow-xl flex-shrink-0 transition-all duration-500 ease-in-out" style={{ minWidth: '200px', maxWidth: '300px' }}>
                      <h4 className="mb-2 text-lg font-semibold" style={{ color: THEME_ACCENT_COLOR }}>{user.email}</h4>
                      <video
                        ref={(el) => {
                          if (el) {
                            remoteVideoRefs.current.set(user.id, el);
                            if (user.stream && el.srcObject !== user.stream) {
                              el.srcObject = user.stream;
                              el.play().catch(e => console.error('Play error:', e));
                            }
                          }
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover rounded-2xl bg-black"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-center p-3 space-x-4">
                  <button onClick={toggleMic} className="px-6 py-3 text-white font-extrabold rounded-xl shadow-lg flex items-center space-x-2" style={{ backgroundColor: isMicOn ? THEME_ACCENT_COLOR : '#666' }}>
                    <span>{isMicOn ? '🎤 Mute' : '🔇 Unmute'}</span>
                  </button>
                  <button onClick={toggleVideo} className="px-6 py-3 text-white font-extrabold rounded-xl shadow-lg flex items-center space-x-2" style={{ backgroundColor: isVideoOn ? THEME_ACCENT_COLOR : '#666' }}>
                    <span>{isVideoOn ? '📹 Stop Video' : '📹 Start Video'}</span>
                  </button>
                  <button onClick={handleLeaveMeeting} className="px-6 py-3 bg-red-600 text-white font-extrabold rounded-xl shadow-lg">End Call</button>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[30%] h-full rounded-xl shadow-2xl border border-gray-300 overflow-hidden">
            <FileUploader refreshKey={refreshKey} room={room} />
          </div>
        </div>
        <div className="flex w-full p-4 gap-4 flex-shrink-0" style={{ minHeight: '80vh', paddingTop: '0' }}>
          <div className="flex-1"><Chats room={room}/></div>
          <div className="flex-1"><GeminiChatUI/></div>
          <div className="flex-1"><Notepad room={room}/></div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default VideoCalling;