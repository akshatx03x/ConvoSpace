# TODO: Implement File Deletion on Last User Leave Room

## Tasks
- [x] Modify `deleteAllFiles` controller to accept room query parameter and delete only files for that room
- [x] Update `fileRoute.js` to pass room in delete-all route
- [x] Add room tracking in backend `index.js` socket events (join and disconnect)
- [x] In socket disconnect, check if room is empty and call deleteAllFiles for that room
- [x] Remove or adjust deleteAllFiles call in frontend `VideoCalling.jsx` handleLeaveMeeting (since it's now automatic on backend)
- [x] Test the functionality
