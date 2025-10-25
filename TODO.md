# TODO: Add Create Room and Join Room Options to Home Screen

## Steps to Complete:
- [x] Add new state variables: joinRoom, generatedRoom, lastGenerated to VideoCalling component.
- [x] Implement generateRoomCode function to create unique 5-digit hex code.
- [x] Update UI in !isJoined block: Add Create Room section with generate button, display code, and start meeting button.
- [x] Update UI in !isJoined block: Add Join Room section with input field and join button.
- [x] Adjust event handlers: Create handleCreateRoom and modify handleSubmit for join.
- [x] Test the functionality: Generate code, start meeting, join with code.
