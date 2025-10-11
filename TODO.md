# TODO: Fix Email Issue After Joining Room

## Steps to Complete:

1. **Update frontend/src/context/SocketProvider.jsx**: Include the JWT token from localStorage in the socket authentication to send it with the connection.

2. **Update backend/index.js - Socket Authentication**: On socket connection, verify the JWT token, retrieve the user from the database, and attach the user object (including email) to the socket for authenticated access.

3. **Update backend/index.js - Room Join Handler**: Modify the 'room:join' event handler to use the authenticated user's email from the socket.user instead of the email from the event data. Emit the response with the correct email.

4. **Test the Changes**: 
   - Start the backend server.
   - Login with a user in the frontend.
   - Join a room and verify the console log shows the correct email.
   - Ensure no spoofing is possible.

Progress: Step 1 completed - Updated SocketProvider to include JWT token in auth.
