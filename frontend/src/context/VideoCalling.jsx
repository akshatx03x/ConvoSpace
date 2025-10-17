    import React, { useState, useEffect, useCallback, useRef } from 'react'
    import { useSocket } from './SocketProvider'
    import peer from '../services/Peer.js'
    import GeminiChatUI from '../pages/GeminiUi.jsx'
    import FeatureCard from '../components/Extras/FeatureCard.jsx'
import QuotesTicker from '../components/Extras/Quotes.jsx'

    const THEME_MAIN_BG = '#c3a6a0'
    const THEME_LIGHT_CARD_BG = '#F0EBEA'
    const THEME_ACCENT_COLOR = '#A06C78'
    const THEME_TEXT_COLOR = '#333333'

    const GRADIENT_BG_DASHBOARD = 'linear-gradient(to right bottom, #E0C0C0, #EAE0E0, #a06c78)'
    const GRADIENT_BG_JOIN = 'linear-gradient(to top right, #E0C0C0, #D5B0B0, #a06c78)'

    const NAVBAR_HEIGHT = '80px'

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
        const { room } = data
        setIsJoined(true)
      }, [])

      useEffect(() => {
        socket.on('room:join', handleJoinRoom)
        return () => socket.off('room:join', handleJoinRoom)
      }, [socket, handleJoinRoom])

      const handleUserJoined = useCallback((data) => setRemoteSocketId(data.id), [])

      useEffect(() => {
        if (isJoined && !myStream) {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
              setMyStream(stream)
              myStreamRef.current = stream
              if (localVideoRef.current) localVideoRef.current.srcObject = stream
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
          setRemoteStream(ev.streams[0])
        })
        peer.peer.addEventListener('negotiationneeded', handleNegoNeeded)
        return () => peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded)
      }, [handleNegoNeeded])

      useEffect(() => {
        if (remoteStream && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
      }, [remoteStream])

      const handleLeaveMeeting = useCallback(() => {
        if (myStreamRef.current) myStreamRef.current.getTracks().forEach(track => track.stop())
        if (peer.peer) peer.peer.close()
        socket.emit('room:leave', { room })
        setIsJoined(false)
        setRemoteSocketId(null)
        setMyStream(null)
        myStreamRef.current = null
        setRemoteStream(null)
        setRoom("")
        setError(null)
      }, [socket, room])

if (!isJoined) {
  return (
    <div 
      className="w-full min-h-screen justify-start items-center p-5 rounded" 
      style={{ 
        backgroundColor: '#d9bdb8', // lighter shade of THEME_MAIN_BG
        height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        marginTop: NAVBAR_HEIGHT
      }}
    >
      <div className='flex justify-center font-medium border-2 border-gray-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer w-2/3 mx-8 p-2 my-5 rounded-b-2xl' style={{backgroundColor:THEME_LIGHT_CARD_BG}}>"Collaborate seamlessly. Innovate effortlessly. Your work, connected." </div>
      <div className="w-2/3 h-[550px] rounded-2xl overflow-hidden flex  m-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
        <div className="w-1/2 p-12 flex flex-col justify-center ">
        
          <h1 className="text-5xl font-extrabold mb-2 " style={{ color: THEME_TEXT_COLOR }}>Hello Again!</h1>
          <p className="text-md text-gray-500 mb-8">Let's get started with your 30 days trial</p>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-7">
            <input
              className="rounded-xl p-4 font-medium border-2 focus:ring-2 shadow-inner"
              style={{ borderColor: THEME_ACCENT_COLOR + '60' }}
              placeholder="Enter Unique Room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button
              className="text-white rounded-xl p-4 font-extrabold shadow-xl hover:scale-[1.01]"
              style={{ backgroundColor: THEME_ACCENT_COLOR }}
              type="submit"
              disabled={!room}
            >
              Connect Now
            </button>
          </form>
        </div>
        <div className="w-1/2 flex flex-col justify-end p-10" style={{ background: GRADIENT_BG_JOIN }}>
          <p className="text-white text-right text-3xl font-light italic">"Connect, collaborate, and conquer."</p>
          <p className="text-white text-right text-lg font-bold mt-4">Your Advantage Awaits.</p>
        </div>
      </div>
<QuotesTicker/>
      <FeatureCard/>
    </div>
  )
}

      return (
        <div 
          className="flex w-full p-0 m-0 overflow-hidden" 
          style={{ 
            backgroundColor: THEME_MAIN_BG,
            height: `calc(100vh - ${NAVBAR_HEIGHT})`,
            marginTop: NAVBAR_HEIGHT 
          }}
        >
          <div className="flex-1 flex justify-center items-center p-4">
            <div className="flex w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl overflow-hidden" style={{ backgroundColor: THEME_LIGHT_CARD_BG }}>
              <div className="w-1/6 flex flex-col justify-end p-6" style={{ background: GRADIENT_BG_DASHBOARD }}>
                <p className="text-white text-right font-bold text-2xl italic opacity-90">Finally, Get your Advantage.</p>
              </div>
              <div className="flex flex-col w-5/6 p-6 space-y-6 justify-between border-l border-gray-300">
                <h2 className="text-3xl font-extrabold" style={{ color: THEME_TEXT_COLOR }}>
                  Room: <span className="text-gray-600 font-medium">{room}</span>
                </h2>
                <div className="flex flex-row gap-4 justify-center flex-grow ">
                  <div className="flex flex-col items-center p-3 bg-white/70 rounded-2xl shadow-xl flex-1">
                    <h4 className="mb-2 text-lg font-semibold" style={{ color: THEME_ACCENT_COLOR }}>You</h4>
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-2xl bg-black" />
                  </div>
                  <div className="flex flex-col items-center p-3 bg-white/70 rounded-2xl shadow-xl flex-1">
                    <h4 className="mb-2 text-lg font-semibold" style={{ color: THEME_ACCENT_COLOR }}>
                      Remote {remoteSocketId ? 'Connected' : 'Waiting...'}
                    </h4>
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover rounded-2xl bg-gray-300" />
                  </div>
                </div>
                <div className="flex justify-center p-3 space-x-4">
                  {remoteSocketId && (
                    <button
                      onClick={handleCallUser}
                      className="px-6 py-3 text-white font-extrabold rounded-full shadow-lg"
                      style={{ backgroundColor: remoteStream ? '#4CAF50' : THEME_ACCENT_COLOR }}
                    >
                      {remoteStream ? 'Call Active' : 'Start Call'}
                    </button>
                  )}
                  <button className="px-6 py-3 text-white font-extrabold rounded-xl shadow-lg" style={{ backgroundColor: THEME_ACCENT_COLOR }}>
                    Mic/Camera
                  </button>
                  <button onClick={handleLeaveMeeting} className="px-6 py-3 bg-red-600 text-white font-extrabold rounded-xl shadow-lg">
                    End Call
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[30%] h-full border-l border-gray-300 overflow-hidden">
            <GeminiChatUI />
          </div>
        </div>
      )
    }

    export default VideoCalling
