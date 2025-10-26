// VideoCalling.jsx (ENHANCED FIX with better stream handling)
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
  const pendingIceCandidates = useRef(new Map());

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
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user?.email;
    if (generatedRoom) {
      socket.emit('room:join', { email, room: generatedRoom });
    }
  };

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    const email = user?.email;
    if (joinRoom) {
      if (/^[A-F0-9]{5}$/.test(joinRoom.toUpperCase())) {
        setRoom(joinRoom.toUpperCase());
        socket.emit('room:join', { email, room: joinRoom.toUpperCase() });
      } else {
        setJoinError("Enter a valid room code.");
      }
    }
  };

  const handleJoinRoom = useCallback((data) => {
    const { room } = data;
    setRoom(room);
    setIsJoined(true);
    setJoinError("");
    console.log('✅ Joined room (client):', room);
  }, []);

  const handleJoinRoomError = useCallback((data) => {
    const { message } = data;
    setJoinError(message || "Invalid room code or meeting not active.");
  }, []);

  useEffect(() => {
    socket.on('room:join', handleJoinRoom);
    socket.on('room:join:error', handleJoinRoomError);
    return () => {
      socket.off('room:join', handleJoinRoom);
      socket.off('room:join:error', handleJoinRoomError);
    };
  }, [socket, handleJoinRoom, handleJoinRoomError]);

  // Initialize local media stream when user joins
  useEffect(() => {
    if (isJoined && !myStream && !mediaStarted) {
      console.log('🎥 Requesting local media...');
      navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      })
        .then((stream) => {
          console.log('✅ Local stream obtained:', {
            id: stream.id,
            audioTracks: stream.getAudioTracks().length,
            videoTracks: stream.getVideoTracks().length
          });
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
    
    // Add user to remote users list
    setRemoteUsers(prev => {
      if (prev.some(u => u.id === id)) {
        console.log('User already in list:', id);
        return prev;
      }
      console.log('Adding new user to list:', id);
      return [...prev, { id, email, stream: null }];
    });

    // If I have a stream, initiate call to the new user
    if (myStreamRef.current) {
      console.log('📞 Initiating call to:', id);
      try {
        // Create peer connection for this user
        const pc = peer.createPeer(
          id,
          (remoteStream) => {
            console.log('✅ Received remote stream from', id, {
              id: remoteStream.id,
              active: remoteStream.active,
              audioTracks: remoteStream.getAudioTracks().length,
              videoTracks: remoteStream.getVideoTracks().length
            });
            
            // Update state with the stream
            setRemoteUsers(prev => 
              prev.map(u => {
                if (u.id === id) {
                  console.log('Updating user stream in state for:', id);
                  return { ...u, stream: remoteStream };
                }
                return u;
              })
            );

            // Also directly set the video element srcObject
            const videoEl = remoteVideoRefs.current.get(id);
            if (videoEl && videoEl.srcObject !== remoteStream) {
              console.log('Setting video element srcObject for:', id);
              videoEl.srcObject = remoteStream;
              videoEl.play().catch(e => console.error('Error playing video:', e));
            }
          },
          async () => {
            console.log('🔄 Negotiation needed for:', id);
            try {
              const offer = await peer.getOffer(id);
              socket.emit('room:peer:nego:needed', { room, offer });
            } catch (err) {
              console.error('Negotiation error:', err);
            }
          },
          (candidate) => {
            console.log('📤 Sending ICE candidate to:', id);
            socket.emit('room:ice:candidate', { room, candidate, to: id });
          }
        );

        console.log('Adding local stream tracks to peer:', id);
        peer.addLocalStreamToPeer(id, myStreamRef.current);

        // Process any pending ICE candidates for this peer
        const pending = pendingIceCandidates.current.get(id);
        if (pending && pending.length > 0) {
          console.log(`Processing ${pending.length} pending ICE candidates for`, id);
          for (const candidate of pending) {
            await peer.addIceCandidate(id, candidate);
          }
          pendingIceCandidates.current.delete(id);
        }

        // Create and send offer
        const offer = await peer.getOffer(id);
        socket.emit('room:call', { room, offer });
        console.log('📤 Sent offer to new user:', id);
      } catch (err) {
        console.error('❌ Error initiating call to new user:', err);
      }
    } else {
      console.warn('⚠️ No local stream available yet');
    }
  }, [socket, room]);

  const handleUserLeft = useCallback((data) => {
    const { id } = data;
    console.log('👋 User left:', id);
    peer.removePeer(id);
    pendingIceCandidates.current.delete(id);
    remoteVideoRefs.current.delete(id);
    setRemoteUsers(prev => prev.filter(user => user.id !== id));
  }, []);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    try {
      console.log('📞 Incoming call from', from);
      
      let stream = myStreamRef.current;
      if (!stream) {
        console.log('Getting local media for incoming call...');
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

      // Create peer connection
      peer.createPeer(
        from,
        (remoteStream) => {
          console.log('✅ Received remote stream from', from, {
            id: remoteStream.id,
            active: remoteStream.active,
            audioTracks: remoteStream.getAudioTracks().length,
            videoTracks: remoteStream.getVideoTracks().length
          });
          
          setRemoteUsers(prev => 
            prev.map(u => {
              if (u.id === from) {
                console.log('Updating user stream in state for:', from);
                return { ...u, stream: remoteStream };
              }
              return u;
            })
          );

          // Also directly set the video element srcObject
          const videoEl = remoteVideoRefs.current.get(from);
          if (videoEl && videoEl.srcObject !== remoteStream) {
            console.log('Setting video element srcObject for:', from);
            videoEl.srcObject = remoteStream;
            videoEl.play().catch(e => console.error('Error playing video:', e));
          }
        },
        async () => {
          console.log('🔄 Negotiation needed for:', from);
          try {
            const offer = await peer.getOffer(from);
            socket.emit('room:peer:nego:needed', { room, offer });
          } catch (err) {
            console.error('Negotiation error:', err);
          }
        },
        (candidate) => {
          console.log('📤 Sending ICE candidate to:', from);
          socket.emit('room:ice:candidate', { room, candidate, to: from });
        }
      );

      console.log('Adding local stream to peer:', from);
      peer.addLocalStreamToPeer(from, stream);

      // Process any pending ICE candidates
      const pending = pendingIceCandidates.current.get(from);
      if (pending && pending.length > 0) {
        console.log(`Processing ${pending.length} pending ICE candidates for`, from);
        for (const candidate of pending) {
          await peer.addIceCandidate(from, candidate);
        }
        pendingIceCandidates.current.delete(from);
      }

      // Set remote offer and create answer
      const answer = await peer.getAnswer(from, offer);
      socket.emit('room:call:accepted', { room, answer });
      console.log('📤 Sent answer to', from);
    } catch (err) {
      console.error('❌ handleIncomingCall error:', err);
      setError("Failed to establish connection.");
    }
  }, [socket, room]);

  const handleCallAccepted = useCallback(async ({ from, answer }) => {
    try {
      console.log('✅ Call accepted by', from);
      await peer.setRemoteDescription(from, answer);
    } catch (err) {
      console.error('❌ handleCallAccepted error:', err);
    }
  }, []);

  const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
    try {
      console.log('🔄 Negotiation incoming from', from);
      const answer = await peer.getAnswer(from, offer);
      socket.emit('room:peer:nego:done', { room, answer });
      console.log('📤 Sent negotiation answer to', from);
    } catch (err) {
      console.error('❌ handleNegoNeedIncoming error:', err);
    }
  }, [socket, room]);

  const handleNegoNeedFinal = useCallback(async ({ from, answer }) => {
    try {
      console.log('✅ Final negotiation answer from', from);
      await peer.setRemoteDescription(from, answer);
    } catch (err) {
      console.error('❌ handleNegoNeedFinal error:', err);
    }
  }, []);

  const handleIceCandidate = useCallback(async ({ candidate, from }) => {
    try {
      if (!candidate) return;
      
      console.log('📥 Received ICE candidate from', from, candidate.type);
      
      // Check if peer connection exists
      if (peer.peers.has(from)) {
        await peer.addIceCandidate(from, candidate);
      } else {
        console.log('⏳ Storing ICE candidate for later:', from);
        if (!pendingIceCandidates.current.has(from)) {
          pendingIceCandidates.current.set(from, []);
        }
        pendingIceCandidates.current.get(from).push(candidate);
      }
    } catch (err) {
      console.error('❌ handleIceCandidate error:', err);
    }
  }, []);

  useEffect(() => {
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

  // Debug: Monitor peer states
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
      const audioTracks = myStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(prev => !prev);
      console.log('🎤 Microphone', !isMicOn ? 'ON' : 'OFF');
    }
  }, [isMicOn]);

  const toggleVideo = useCallback(() => {
    if (myStreamRef.current) {
      const videoTracks = myStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(prev => !prev);
      console.log('📹 Video', !isVideoOn ? 'ON' : 'OFF');
    }
  }, [isVideoOn]);

  const handleLeaveMeeting = useCallback(async () => {
    console.log('👋 Leaving meeting');
    setIsJoined(false);
    try {
      if (myStreamRef.current) {
        myStreamRef.current.getTracks().forEach(track => track.stop());
      }
      peer.closeAllPeers();
      pendingIceCandidates.current.clear();
      remoteVideoRefs.current.clear();
      socket.emit('room:leave', { room });
      setMyStream(null);
      myStreamRef.current = null;
      setRoom("");
      setError(null);
      setRemoteUsers([]);
      setMediaStarted(false);
      setRefreshKey(prev => prev + 1);
      localStorage.removeItem(`notes_${room}`);
    } catch (error) {
      console.error('❌ Error leaving meeting:', error);
    }
  }, [socket, room]);

  if (!isJoined) {
    return (
      <div
        className="w-full min-h-screen justify-start items-center p-5 rounded-2xl"
        style={{
          backgroundColor: '#d9bdb8',
          height: `calc(100vh - ${NAVBAR_HEIGHT})`,
          marginTop: NAVBAR_HEIGHT
        }}
      >
        <div className='flex justify-center font-medium border-2 border-gray-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer w-2/3 mx-8 p-2 my-5 rounded-b-2xl' style={{backgroundColor:THEME_LIGHT_CARD_BG}}>"Collaborate seamlessly. Innovate effortlessly. Your work, connected." </div>
        <div className="w-2/3 h-[550px] rounded-2xl overflow-hidden flex  m-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
          <div className="w-3/4 p-12 flex flex-col justify-center ">
            <h1 className="text-5xl font-extrabold mb-2 " style={{ color: THEME_TEXT_COLOR }}>Hello Again!</h1>
            <p className="text-md text-gray-500 mb-8">Let's get started with your 30 days trial</p>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: THEME_TEXT_COLOR }}>Create Room-</h2>
              <button
                onClick={generateRoomCode}
                className="text-white rounded-xl p-4 font-extrabold shadow-xl hover:scale-[1.01] mb-4"
                style={{ backgroundColor: THEME_ACCENT_COLOR }}
              >
                Generate Room Code
              </button>
              {generatedRoom && (
                <div className="mb-4">
                  <p className="text-lg font-medium" style={{ color: THEME_TEXT_COLOR }}>Room Code: <span className="font-bold">{generatedRoom}</span></p>
                  <form onSubmit={handleCreateRoom} className="flex flex-col space-y-4">
                    <button
                      className="text-white rounded-xl p-4 font-extrabold shadow-xl hover:scale-[1.01]"
                      style={{ backgroundColor: THEME_ACCENT_COLOR }}
                      type="submit"
                    >
                      Start Meeting
                    </button>
                  </form>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: THEME_TEXT_COLOR }}>Join Room-</h2>
              <form onSubmit={handleJoinRoomSubmit} className="flex flex-col space-y-4">
                <input
                  className="rounded-xl p-4 font-medium border-2 focus:ring-2 shadow-inner"
                  style={{ borderColor: THEME_ACCENT_COLOR + '60' }}
                  placeholder="Enter Shared Room Code"
                  value={joinRoom}
                  onChange={(e) => setJoinRoom(e.target.value)}
                />
                <button
                  className="text-white rounded-xl p-4 font-extrabold shadow-xl hover:scale-[1.01]"
                  style={{ backgroundColor: THEME_ACCENT_COLOR }}
                  type="submit"
                  disabled={!joinRoom}
                >
                  Join Meeting
                </button>
                {joinError && (
                  <p className="text-red-500 text-sm font-medium">{joinError}</p>
                )}
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
      <div
        className="flex flex-col w-full p-0 m-0 overflow-y-auto"
        style={{
          backgroundColor: THEME_MAIN_BG,
          minHeight: `calc(100vh - ${NAVBAR_HEIGHT})`,
          marginTop: NAVBAR_HEIGHT
        }}
      >
        <div className="flex w-30/31 p-4 gap-4 flex-shrink-0"
          style={{
            height: '85vh',
            maxHeight: '85vh',
          }}>
          <div className="flex-1 flex justify-center items-center">
            <div className="flex w-full h-full rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
              <div className="w-1/6 flex flex-col justify-end p-6" style={{ background: GRADIENT_BG_DASHBOARD }}>
                <p className="text-white text-right font-bold text-2xl italic opacity-90">Finally, Get your Advantage.</p>
              </div>
              <div className="flex flex-col w-5/6 p-6 space-y-6 justify-between border-l border-gray-300">
                <h2 className="text-3xl font-extrabold" style={{ color: THEME_TEXT_COLOR }}>
                  Room: <span className="text-gray-600 font-medium">{room}</span>
                </h2>
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
                              console.log('Setting stream for video element:', user.id);
                              el.srcObject = user.stream;
                              el.play().catch(e => console.error('Error playing video:', e));
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1C10.3431 1 9 2.34315 9 4V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V4C15 2.34315 13.6569 1 12 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 10V12C19 16.4183 15.4183 20 11 20H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      {!isMicOn && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
                    </svg>
                    <span>{isMicOn ? 'Mute Mic' : 'Unmute Mic'}</span>
                  </button>
                  <button onClick={toggleVideo} className="px-6 py-3 text-white font-extrabold rounded-xl shadow-lg flex items-center space-x-2" style={{ backgroundColor: isVideoOn ? THEME_ACCENT_COLOR : '#666' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 10L19.553 7.724C20.127 7.418 20.127 6.582 19.553 6.276L12 2C11.426 1.694 10.574 1.694 10 2L2.447 6.276C1.873 6.582 1.873 7.418 2.447 7.724L7 10M15 10L19.553 12.276C20.127 12.582 20.127 13.418 19.553 13.724L12 18C11.426 18.306 10.574 18.306 10 18L2.447 13.724C1.873 13.418 1.873 12.582 2.447 12.276L7 10M15 10V14C15 15.105 14.105 16 13 16H11C9.895 16 9 15.105 9 14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      {!isVideoOn && <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>}
                    </svg>
                    <span>{isVideoOn ? 'Turn Off Video' : 'Turn On Video'}</span>
                  </button>
                  <button onClick={handleLeaveMeeting} className="px-6 py-3 bg-red-600 text-white font-extrabold rounded-xl shadow-lg">
                    End Call
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[30%] h-full rounded-xl shadow-2xl border border-gray-300 overflow-hidden">
            <FileUploader refreshKey={refreshKey} room={room} />
          </div>

        </div>

        <div className="flex w-full p-4 gap-4 flex-shrink-0" style={{ minHeight: '80vh', paddingTop: '0' }}>
          <div className="flex-1">
            <Chats room={room}/>
          </div>
          <div className="flex-1">
            <GeminiChatUI/>
          </div>
          <div className="flex-1">
            <Notepad room={room}/>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default VideoCalling;