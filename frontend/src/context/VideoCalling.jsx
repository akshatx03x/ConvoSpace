// VideoCalling.jsx (UI Redesign - Apple/Google Inspired - FINAL VIDEO LAYOUT FIX)
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
import { Zap, Mic, MicOff, Video, VideoOff, PhoneOff, Users, Clock } from 'lucide-react';

// Design Tokens from NavBar.jsx (unchanged)
const DESIGN_TOKENS = {
  colors: {
    primary: '#0066FF',       // Vibrant blue
    primaryHover: '#0052CC',
    secondary: '#FF3B30',     // Accent red
    surface: '#FFFFFF',
    surfaceElevated: '#F5F5F7',
    border: '#E5E5EA',
    text: {
      primary: '#1D1D1F',
      secondary: '#86868B',
      tertiary: '#AEAEB2'
    },
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.1)',
    lg: '0 12px 40px rgba(0,0,0,0.12)',
    glow: '0 0 20px rgba(102, 126, 234, 0.3)'
  },
  blur: 'blur(20px)',
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px'
  }
};

// Component-specific values
const NAVBAR_HEIGHT = '64px';
const ACCENT_GRADIENT = DESIGN_TOKENS.colors.gradient;
const PRIMARY_TEXT = DESIGN_TOKENS.colors.text.primary;
const SECONDARY_TEXT = DESIGN_TOKENS.colors.text.secondary;
const SURFACE_BG = DESIGN_TOKENS.colors.surface;
const ELEVATED_BG = DESIGN_TOKENS.colors.surfaceElevated;
const BORDER_COLOR = DESIGN_TOKENS.colors.border;

// Helper component for consistent card styling (Glass/Elevated)
const ElevatedCard = ({ children, className = '', style = {} }) => (
  <div
    className={`p-6 rounded-xl transition-all duration-300 ${className}`}
    style={{
      backgroundColor: DESIGN_TOKENS.colors.surface,
      boxShadow: DESIGN_TOKENS.shadows.md,
      border: `1px solid ${DESIGN_TOKENS.colors.border}`,
      ...style,
    }}
  >
    {children}
  </div>
);

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

  // --- START: Functionality (Omitted for brevity, unchanged) ---
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

  // ********** (All other socket/peer handling functions remain unchanged) **********
  useEffect(() => {
    if (!socket) return;
    socket.on('room:join', handleJoinRoom);
    socket.on('room:join:error', handleJoinRoomError);
    return () => {
      socket.off('room:join', handleJoinRoom);
      socket.off('room:join:error', handleJoinRoomError);
    };
  }, [socket, handleJoinRoom, handleJoinRoomError]);

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
  // --- END: Functionality (Omitted for brevity, unchanged) ---

  // Loading/Connecting State
  if (!socket) {
    return (
      <div 
        className="w-full min-h-screen flex items-center justify-center" 
        style={{ 
          backgroundColor: ELEVATED_BG, 
          height: `calc(100vh - ${NAVBAR_HEIGHT})`, 
          marginTop: NAVBAR_HEIGHT 
        }}>
        <div className="text-center">
          <Zap size={32} style={{ color: DESIGN_TOKENS.colors.primary }} className="mx-auto mb-4 animate-pulse" />
          <div className="text-2xl font-bold mb-2" style={{ color: PRIMARY_TEXT }}>
            Connecting to ConvoSpace...
          </div>
          <div className="text-sm" style={{ color: SECONDARY_TEXT }}>
            Establishing a secure connection. Please wait.
          </div>
        </div>
      </div>
    );
  }

  // Pre-Call/Join State (The Landing Page) (Omitted for brevity)
  if (!isJoined) {
    // ... (All code for the Join state, QuotesTicker, About, Footer calls remains unchanged)
    return (
      <div 
        className="w-full pt-8 px-4 sm:px-6 md:px-8 lg:px-12" 
        style={{ 
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`, 
          marginTop: NAVBAR_HEIGHT, 
          backgroundColor: ELEVATED_BG 
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Main Join Panel (Responsive Layout) */}
          <ElevatedCard className="flex flex-col lg:flex-row mb-12 lg:h-[580px] p-0 overflow-hidden hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
            {/* Left Content Area (Forms) */}
            <div className="w-full lg:w-3/5 p-8 sm:p-12 flex flex-col justify-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-2" style={{ color: PRIMARY_TEXT }}>
                Start a New Session
              </h1>
              <p className="text-md sm:text-lg mb-8" style={{ color: SECONDARY_TEXT }}>
                Create a secure room or join an existing one in seconds.
              </p>

              {/* Create Room Section */}
              <div className="mb-8 p-6 rounded-xl" style={{ backgroundColor: ELEVATED_BG }}>
                <h2 className="text-xl font-bold mb-4 flex items-center" style={{ color: PRIMARY_TEXT }}>
                  <Zap size={18} style={{ color: DESIGN_TOKENS.colors.primary }} className="mr-2" />
                  Create Instant Room
                </h2>
                <button 
                  onClick={generateRoomCode} 
                  className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.01] mb-4" 
                  style={{ background: ACCENT_GRADIENT, boxShadow: DESIGN_TOKENS.shadows.md }}
                >
                  Generate New Room Code
                </button>
                {generatedRoom && (
                  <form onSubmit={handleCreateRoom} className="flex flex-col space-y-3 mt-4">
                    <p className="text-sm font-medium" style={{ color: SECONDARY_TEXT }}>
                      Share this code: <span className="font-bold text-lg" style={{ color: PRIMARY_TEXT }}>{generatedRoom}</span>
                    </p>
                    {/* FIX 1: Apply ACCENT_GRADIENT theme to the "Start Meeting" button */}
                    <button 
                      className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.01]" 
                      style={{ background: ACCENT_GRADIENT, boxShadow: DESIGN_TOKENS.shadows.md }} 
                      type="submit"
                    >
                      Start Meeting
                    </button>
                  </form>
                )}
              </div>

              {/* Join Room Section */}
              <div className="p-6 rounded-xl" style={{ backgroundColor: ELEVATED_BG }}>
                <h2 className="text-xl font-bold mb-4 flex items-center" style={{ color: PRIMARY_TEXT }}>
                  <Users size={18} style={{ color: DESIGN_TOKENS.colors.primary }} className="mr-2" />
                  Join Existing Room
                </h2>
                <form onSubmit={handleJoinRoomSubmit} className="flex flex-col space-y-4">
                  <input 
                    className="rounded-xl p-4 font-medium border-2 focus:ring-2 focus:ring-opacity-50" 
                    style={{ 
                      borderColor: BORDER_COLOR, 
                      backgroundColor: SURFACE_BG,
                      color: PRIMARY_TEXT,
                      boxShadow: DESIGN_TOKENS.shadows.sm,
                      outline: 'none',
                      '--tw-ring-color': DESIGN_TOKENS.colors.primary
                    }} 
                    placeholder="Enter 5-Character Room Code (e.g., A1B2C)" 
                    value={joinRoom} 
                    onChange={(e) => setJoinRoom(e.target.value.toUpperCase())} 
                    maxLength={5}
                  />
                  <button 
                    className="w-full px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.01]" 
                    style={{ background: ACCENT_GRADIENT, boxShadow: DESIGN_TOKENS.shadows.md }} 
                    type="submit" 
                    disabled={!joinRoom || joinRoom.length !== 5}
                  >
                    Join Meeting
                  </button>
                  {joinError && <p className="text-red-500 text-sm font-medium mt-2">{joinError}</p>}
                </form>
              </div>
            </div>

            {/* Right Promotional Area (Gradient) */}
            <div 
              className="w-full lg:w-2/5 p-12 flex flex-col justify-between rounded-b-xl lg:rounded-r-xl lg:rounded-bl-none min-h-[200px] lg:min-h-full" 
              style={{ background: ACCENT_GRADIENT, boxShadow: DESIGN_TOKENS.shadows.lg }}
            >
              <h3 className="text-3xl font-extrabold text-white mb-4">ConvoSpace Advantage</h3>
              <ul className="space-y-4">
                <li className="flex items-center text-white/90">
                  <Zap size={20} className="mr-3" />
                  <span className="font-medium">Instant Peer-to-Peer Connection</span>
                </li>
                <li className="flex items-center text-white/90">
                  <Clock size={20} className="mr-3" />
                  <span className="font-medium">Real-time Collaboration Tools</span>
                </li>
                <li className="flex items-center text-white/90">
                  <Users size={20} className="mr-3" />
                  <span className="font-medium">Seamless Multi-user Experience</span>
                </li>
              </ul>
              <p className="text-white text-right text-xl font-light italic mt-12">
                "Where innovation finds its voice."
              </p>
            </div>
          </ElevatedCard>
        </div>
        
        {/* Supplementary Content */}
        <div className="max-w-7xl mx-auto space-y-12">
          <QuotesTicker />
          <About />
        </div>
        <Footer />
      </div>
    );
  }

  // In-Call/Joined State (The Dashboard)
  const totalUsers = 1 + remoteUsers.length; // Local user + remote users
  
  // FIX: Dynamic Grid Logic (Ensures good sizing for 1, 2, or 3 users)
  const getVideoGridClass = (count) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 lg:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3'; 
    // For 4 or more, use a 2x2 on medium, and 3+ on large
    return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'; 
  };
  
  // Calculate grid class based on total users
  const gridClass = getVideoGridClass(totalUsers);

  return (
    <div 
      className="w-full p-4 sm:p-6 lg:p-8" 
      style={{ 
        backgroundColor: ELEVATED_BG, 
        minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`, 
        marginTop: NAVBAR_HEIGHT 
      }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Main Video Area & Room Info */}
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[70vh]">
          {/* Main Video Panel (Large View) */}
          <ElevatedCard className="flex-1 p-4 flex flex-col overflow-hidden">
            <h2 className="text-2xl font-extrabold mb-4" style={{ color: PRIMARY_TEXT }}>
              Room: <span className="font-semibold text-lg" style={{ color: DESIGN_TOKENS.colors.primary }}>{room}</span>
            </h2>

            {/* FIX: Video Grid Wrapper - Handles the fixed height and overflow scroll */}
            <div 
              className="flex-grow overflow-x-auto overflow-y-hidden pb-4" // Horizontal scroll for overflow, hiding vertical scrollbar
              style={{ maxHeight: 'calc(100% - 100px)' }} // Limit height within card
            >
              <div className="flex space-x-4">
                
                {/* Local Video */}
                <div 
                  className="flex-shrink-0 relative bg-black rounded-xl overflow-hidden shadow-lg border-4" 
                  style={{ 
                    borderColor: DESIGN_TOKENS.colors.primary, 
                    width: '320px', // Fixed width for horizontal scroll
                    height: '200px' // Fixed height for a 16:10 aspect ratio close to 16:9
                  }}
                >
                  <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 text-white text-xs font-semibold rounded-full backdrop-blur-sm">You</div>
                  <div className="absolute bottom-3 right-3 flex space-x-2">
                    <div className={`p-2 rounded-full backdrop-blur-md ${isMicOn ? 'bg-white/20' : 'bg-red-500/80'}`}>
                      {isMicOn ? <Mic size={16} color="white" /> : <MicOff size={16} color="white" />}
                    </div>
                    <div className={`p-2 rounded-full backdrop-blur-md ${isVideoOn ? 'bg-white/20' : 'bg-red-500/80'}`}>
                      {isVideoOn ? <Video size={16} color="white" /> : <VideoOff size={16} color="white" />}
                    </div>
                  </div>
                </div>

                {/* Remote Videos */}
                {remoteUsers.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex-shrink-0 relative bg-black rounded-xl overflow-hidden shadow-lg border-2 border-gray-400" 
                    style={{ 
                      width: '320px', // Fixed width
                      height: '200px' // Fixed height
                    }}
                  >
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
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/50 text-white text-xs font-semibold rounded-full backdrop-blur-sm truncate max-w-[80%]">{user.email || 'Guest'}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Controls Bar */}
            <div className="flex justify-center p-4 mt-4 space-x-4 bg-white/70 rounded-full backdrop-blur-lg shadow-xl self-center">
              <button 
                onClick={toggleMic} 
                className={`p-3 rounded-full transition-all duration-200 hover:scale-105 ${isMicOn ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-red-500 text-white hover:bg-red-600'}`}
                style={{ boxShadow: DESIGN_TOKENS.shadows.sm }}
                aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button 
                onClick={toggleVideo} 
                className={`p-3 rounded-full transition-all duration-200 hover:scale-105 ${isVideoOn ? 'bg-white text-gray-700 hover:bg-gray-100' : 'bg-red-500 text-white hover:bg-red-600'}`}
                style={{ boxShadow: DESIGN_TOKENS.shadows.sm }}
                aria-label={isVideoOn ? 'Stop video' : 'Start video'}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              
              <button 
                onClick={handleLeaveMeeting} 
                className="p-3 bg-red-600 text-white rounded-full transition-all duration-200 hover:bg-red-700 hover:scale-105"
                style={{ boxShadow: DESIGN_TOKENS.shadows.md }}
                aria-label="End call"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </ElevatedCard>

          {/* Right Sidebar (File Uploader) */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <ElevatedCard className="h-full p-0 overflow-hidden">
              <FileUploader refreshKey={refreshKey} room={room} />
            </ElevatedCard>
          </div>
        </div>

        {/* Collaboration Tools Section (Bottom 3 Panels) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ElevatedCard className="min-h-[40vh] p-0 overflow-hidden">
            <Chats room={room} />
          </ElevatedCard>
          <ElevatedCard className="min-h-[40vh] p-0 overflow-hidden">
            <GeminiChatUI />
          </ElevatedCard>
          <ElevatedCard className="min-h-[40vh] p-0 overflow-hidden">
            <Notepad room={room} />
          </ElevatedCard>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VideoCalling;