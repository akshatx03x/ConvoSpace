import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketProvider'
import { toast } from 'react-toastify'

const THEME_LIGHT_CARD_BG = '#F0EBEA'
const THEME_ACCENT_COLOR = '#A06C78'
const THEME_TEXT_COLOR = '#333333'

const Chats = ({ room }) => {
const [messages, setMessages] = useState([])
const [message, setMessage] = useState('')
const socket = useSocket()
const messagesContainerRef = useRef(null)

const scrollToBottom = () => {
	if (messagesContainerRef.current) {
		messagesContainerRef.current.scrollTo({
			top: messagesContainerRef.current.scrollHeight,
			behavior: 'smooth',
		})
	}
}

useEffect(() => {
	scrollToBottom()
}, [messages])

useEffect(() => {
	if (!socket) return

	const handleMessage = ({ name, message }) => {
		setMessages(prev => [...prev, { name, message, isOwn: false }])
		toast.info(`New message from ${name}: ${message}`)
	}

	const handleFileEvent = ({ uploader, name }) => {
		toast.info(`File event: ${name} by ${uploader}`)
	}

	const handleUserJoin = ({ email }) => {
		toast.info(`New user joined: ${email}`)
	}

	socket.on('receive:message', handleMessage)
	socket.on('file:shared', handleFileEvent)
	socket.on('file:deleted', handleFileEvent)
	socket.on('user:join', handleUserJoin)

	return () => {
		socket.off('receive:message', handleMessage)
		socket.off('file:shared', handleFileEvent)
		socket.off('file:deleted', handleFileEvent)
		socket.off('user:join', handleUserJoin)
	}
}, [socket])

const sendMessage = () => {
	if (message.trim() && socket) {
		socket.emit('send:message', { room, message })
		setMessages(prev => [...prev, { name: 'You', message, isOwn: true }])
		setMessage('')
	}
}

const handleKeyPress = (e) => {
	if (e.key === 'Enter') sendMessage()
}

// Welcome screen when no chats yet
const WelcomePreview = () => (
	<div className="flex flex-col items-center justify-center h-full text-center p-8">
		<span className="text-4xl mb-3">💬</span>
		<h3 className="text-xl font-bold" style={{ color: THEME_ACCENT_COLOR }}>
			Start the Conversation
		</h3>
		<p className="text-sm mt-1" style={{ color: THEME_TEXT_COLOR }}>
			Send a message below to begin chatting with others in the room.
		</p>
		<p className="text-xs opacity-60 mt-2">
			Notifications for new messages and file events will appear here.
		</p>
	</div>
)

return (
	<div
		className="w-full flex flex-col rounded-2xl shadow-xl overflow-hidden"
		style={{
			height: '590px', 
			backgroundColor: 'white',
			color: THEME_TEXT_COLOR,
		}}
	>
		{/* Header */}
		<div
			className="p-3 text-lg font-extrabold flex items-center justify-between shadow-md"
			style={{ backgroundColor: THEME_ACCENT_COLOR, color: 'white' }}
		>
			<div className="flex items-center space-x-2">
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
				</svg>
				<span>Live Chat</span>
			</div>
			<div className="text-xs px-2 py-1 rounded-full bg-green-500/80 font-semibold">
				2 Online
			</div>
		</div>

		{/* ✅ Chat Messages Scroll Area */}
		<div
			ref={messagesContainerRef}
			className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar"
			style={{
				backgroundColor: THEME_LIGHT_CARD_BG,
			}}
		>
			{messages.length === 0 ? (
				<WelcomePreview />
			) : (
				messages.map((msg, index) => (
					<div key={index} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
						<div
							className="max-w-[75%] p-3 rounded-xl shadow-sm"
							style={{
								backgroundColor: msg.isOwn ? THEME_ACCENT_COLOR + '20' : 'white',
								borderBottomLeftRadius: msg.isOwn ? '0.75rem' : '0',
								borderBottomRightRadius: msg.isOwn ? '0' : '0.75rem',
							}}
						>
							<span className="text-xs font-bold" style={{ color: msg.isOwn ? THEME_TEXT_COLOR : THEME_ACCENT_COLOR }}>
								{msg.name}
							</span>
							<p className="text-sm mt-0.5">{msg.message}</p>
						</div>
					</div>
				))
			)}
		</div>

		{/* Input box */}
		<div className="p-3 flex items-center bg-white border-t" style={{ borderColor: THEME_ACCENT_COLOR + '40' }}>
			<input
				type="text"
				placeholder="Send a message..."
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				onKeyPress={handleKeyPress}
				className="flex-1 p-2 border-none rounded-lg focus:ring-0 focus:outline-none"
				style={{ backgroundColor: 'transparent', color: THEME_TEXT_COLOR }}
			/>
			<button
				onClick={sendMessage}
				className="p-2 ml-2 rounded-full shadow-md transition-transform duration-200 hover:scale-[1.05]"
				style={{ backgroundColor: THEME_ACCENT_COLOR, color: 'white' }}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
				</svg>
			</button>
		</div>
	</div>
)


}

export default Chats