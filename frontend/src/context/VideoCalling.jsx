import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSocket } from './SocketProvider'
import peer from '../services/Peer.js'

const THEME_MAIN_BG = '#c3a6a0'
const THEME_LIGHT_CARD_BG = '#F0EBEA'
const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'

const GRADIENT_BG_DASHBOARD = 'linear-gradient(to right bottom, #E0C0C0, #EAE0E0, #a06c78)'
const GRADIENT_BG_JOIN = 'linear-gradient(to top right, #E0C0C0, #D5B0B0, #a06c78)'

const VideoCalling = () => {
  const [room, setRoom] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [remoteSocketId, setRemoteSocketId] = useState(null)
  const [myStream, setMyStream] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [error, setError] = useState(null)

  const localVideoRef = useRef()
  const remoteVideoRef = useRef()
  const socket = useSocket()
  const myStreamRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem('user'))
    const email = user?.email
    if (room) {
      socket.emit('room:join', { email, room })
    }
  }

  const handleJoinRoom = useCallback((data) => {
    const { email, room } = data
    setIsJoined(true)
  }, [])

  useEffect(() => {
    socket.on('room:join', handleJoinRoom)
    return () => {
      socket.off('room:join', handleJoinRoom)
    }
  }, [socket, handleJoinRoom])

  const handleUserJoined = useCallback((data) => {
    const { id } = data
    setRemoteSocketId(id)
  }, [])

  useEffect(() => {
    if (isJoined && !myStream) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setMyStream(stream)
          myStreamRef.current = stream
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream
          }
        })
        .catch(() => setError("Camera/microphone not accessible."))
    }
  }, [isJoined, myStream])

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from)
    try {
      let stream = myStreamRef.current
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setMyStream(stream)
        myStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      }
      const answer = await peer.getAnswer(offer)
      socket.emit('call:accepted', { to: from, answer })
      for (const track of stream.getTracks()) peer.peer.addTrack(track, stream)
    } catch {
      setError("Camera/microphone not available.")
    }
  }, [socket])

  const handleCallUser = useCallback(async () => {
    try {
      let stream = myStreamRef.current
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setMyStream(stream)
        myStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
      }
      const offer = await peer.getOffer()
      socket.emit('user:call', { to: remoteSocketId, offer })
      for (const track of stream.getTracks()) peer.peer.addTrack(track, stream)
    } catch {
      setError("Camera/microphone not available.")
    }
  }, [remoteSocketId, socket])

  const handleCallAccepted = useCallback(async ({ answer }) => {
    await peer.setRemoteDescription(answer)
  }, [])

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer()
    socket.emit('peer:nego:needed', { to: remoteSocketId, offer })
  }, [remoteSocketId, socket])

  const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
    await peer.setRemoteDescription(offer)
    const answer = await peer.getAnswer()
    socket.emit('peer:nego:done', { to: from, answer })
  }, [socket])

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
    await peer.setRemoteDescription(answer)
  }, [])

  useEffect(() => {
    socket.on('user:join', handleUserJoined)
    socket.on('incoming:call', handleIncomingCall)
    socket.on('call:accepted', handleCallAccepted)
    socket.on('peer:nego:needed', handleNegoNeedIncoming)
    socket.on('peer:nego:final', handleNegoNeedFinal)
    return () => {
      socket.off('user:join', handleUserJoined)
      socket.off('incoming:call', handleIncomingCall)
      socket.off('call:accepted', handleCallAccepted)
      socket.off('peer:nego:needed', handleNegoNeedIncoming)
      socket.off('peer:nego:final', handleNegoNeedFinal)
    }
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal])

  useEffect(() => {
    peer.peer.addEventListener('track', async (ev) => {
      const remoteStream = ev.streams
      setRemoteStream(remoteStream[0])
    })
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded)
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
    }
  }, [handleNegoNeeded])

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  const handleLeaveMeeting = useCallback(() => {
    if (myStreamRef.current) {
      myStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peer.peer) {
      peer.peer.close()
    }
    socket.emit('room:leave', { room })
    setIsJoined(false)
    setRemoteSocketId(null)
    setMyStream(null)
    myStreamRef.current = null
    setRemoteStream(null)
    setRoom("")
    setError(null)
  }, [socket, room])

  if (isJoined) {
    return (
      <div className="flex w-full h-screen justify-center items-center p-4 pt-16" style={{ backgroundColor: THEME_MAIN_BG }}>
        <div className="flex w-full max-w-7xl h-[85vh] rounded-[40px] shadow-2xl overflow-hidden" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
          <div className="flex flex-col w-2/3 p-8 space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight" style={{ color: THEME_TEXT_COLOR }}>
              Room: <span className="text-gray-600 font-medium">{room}</span>
            </h2>
            {error && <p className="text-red-500 text-center font-semibold">{error}</p>}
            <div className="flex flex-row gap-6 justify-center flex-grow">
              <div className="flex flex-col items-center p-3 bg-white/70 rounded-3xl shadow-xl backdrop-blur-sm transition duration-300 hover:shadow-2xl transform hover:scale-[1.01] flex-1 min-w-0">
                <h4 className="mb-2 text-lg font-semibold" style={{ color: THEME_ACCENT_COLOR }}>You (Local)</h4>
                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-2xl bg-black shadow-inner" />
              </div>
              <div className="flex flex-col items-center p-3 bg-white/70 rounded-3xl shadow-xl backdrop-blur-sm flex-1 min-w-0">
                <h4 className="mb-2 text-lg font-semibold" style={{ color: THEME_ACCENT_COLOR }}>Remote {remoteSocketId ? 'Connected' : 'Waiting...'}</h4>
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl bg-gray-300 shadow-inner" />
              </div>
            </div>
            <div className="flex justify-center p-3 space-x-4 bg-white/50 rounded-full shadow-lg">
              {remoteSocketId && (
                <button onClick={handleCallUser} className="px-6 py-3 text-white font-extrabold rounded-full shadow-lg transition duration-300 transform hover:scale-[1.05]" style={{ backgroundColor: remoteStream ? '#4CAF50' : THEME_ACCENT_COLOR }}>
                  {remoteStream ? 'Call Active' : 'Start Call'}
                </button>
              )}
              <button className="px-6 py-3 text-white font-extrabold rounded-full shadow-lg transition duration-300 transform hover:scale-[1.05]" style={{ backgroundColor: THEME_ACCENT_COLOR, opacity: 0.8 }}>
                Mic/Camera Controls
              </button>
              <button onClick={handleLeaveMeeting} className="px-6 py-3 bg-red-600 text-white font-extrabold rounded-full shadow-lg transition duration-300 transform hover:scale-[1.05]">
                End Call
              </button>
            </div>
          </div>
          <div className="w-1/3 flex flex-col justify-end p-10" style={{ background: GRADIENT_BG_DASHBOARD }}>
            <p className="text-white text-right text-3xl font-light italic opacity-90">
              Finally, Get your Advantage.
            </p>
            <p className="text-white text-right text-sm font-light mt-2">
              Video Calling powered by WebRTC.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex justify-center items-center p-4 pt-16" style={{ backgroundColor: THEME_MAIN_BG }}>
      <div className="w-[900px] h-[550px] rounded-[50px] overflow-hidden flex shadow-2xl transition duration-500 hover:shadow-3xl" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', backgroundColor: THEME_LIGHT_CARD_BG }}>
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <h1 className="text-5xl font-extrabold tracking-tighter mb-2" style={{ color: THEME_TEXT_COLOR }}>
            Hello Again!
          </h1>
          <p className="text-md text-gray-500 mb-8">
            Let's get started with your 30 days trial
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-7">
            <input className="rounded-xl p-4 font-medium border-2 focus:ring-2 transition duration-300 shadow-inner placeholder-gray-400" style={{ borderColor: THEME_ACCENT_COLOR + '60', outlineColor: THEME_ACCENT_COLOR, backgroundColor: '#f7f7f7' }} placeholder="Enter Unique Room ID" type="text" id="room" value={room} onChange={(e) => setRoom(e.target.value)} />
            <button className="text-white rounded-xl p-4 font-extrabold tracking-wide transition duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.01] disabled:opacity-50" style={{ backgroundColor: THEME_ACCENT_COLOR }} type="submit" disabled={!room}>
              Connect Now
            </button>
          </form>
        </div>
        <div className="w-1/2 flex flex-col justify-end p-10 rounded-l-[20px] shadow-inner" style={{ background: GRADIENT_BG_JOIN }}>
          <p className="text-white text-right text-3xl font-light italic tracking-tight opacity-95">
            "Connect, collaborate, and conquer."
          </p>
          <p className="text-white text-right text-lg font-bold mt-4 tracking-wider">
            Your Advantage Awaits.
          </p>
          <p className="text-white text-right text-xs mt-1 opacity-70">
            A secure WebRTC connection.
          </p>
        </div>
      </div>
    </div>
  )
}

export default VideoCalling
