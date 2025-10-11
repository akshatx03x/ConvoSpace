import React, {useState, useEffect, useCallback} from 'react'
import { useSocket } from './SocketProvider';

const VideoCalling = () => {
    const [room, setRoom] = useState("");
    
        const socket= useSocket();
        
    const handleSubmit = (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user'));
        const email = user?.email;
        socket.emit('room:join', { email, room });
        console.log(`Joining room: ${room}`);
    }

const handleJoinRoom= useCallback((data)=>{
    const{email, room} = data;
    console.log(`Joined room: ${room} with email: ${email}`);
});

useEffect(()=>{
    socket.on('room:join', handleJoinRoom);
    return()=>{
        socket.off('room:join', handleJoinRoom);
    }
})

  return (
    <div>
      <div className="w-1/2 h-1/2 p-19 m-10 bg-[#eed9de] rounded-3xl ">
      <form onSubmit={handleSubmit} className='flex flex-col justify-center font-bold' action="">
        <label className='text-4xl m-1' htmlFor="room">Join Room</label>
        <br />
        <input className='rounded-full p-3 font-medium border-gray-400 border ' placeholder='Enter Room Id' type="text" id='room' value={room} onChange={(e)=>{
            setRoom(e.target.value)}
        } /><br/>
        <button className='bg-[#A06C78] text-white rounded-4xl m-1 w-1/5 p-2 font-bold hover:bg-amber-500' type="submit">Join</button>
      </form>
      </div>
    </div>
  )
}

export default VideoCalling
