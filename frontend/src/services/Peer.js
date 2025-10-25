class PeerService {
    constructor() {
        this.peers = new Map(); // Map of socketId to { pc, onStream }
    }

    createPeer(socketId, onStream) {
        const pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302",
                        "stun:global.stun.twilio.com:3478"
                    ]
                }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                // Handle ICE candidates if needed, but for now, assuming trickle ICE is handled elsewhere
            }
        };

        pc.ontrack = (event) => {
            if (onStream) {
                onStream(event.streams[0]);
            }
        };

        this.peers.set(socketId, { pc, onStream });
        return pc;
    }

    async getAnswer(socketId, offer) {
        const peer = this.peers.get(socketId);
        if (peer) {
            await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peer.pc.createAnswer();
            await peer.pc.setLocalDescription(new RTCSessionDescription(answer));
            return answer;
        }
    }

    async getOffer(socketId) {
        const peer = this.peers.get(socketId);
        if (peer) {
            const offer = await peer.pc.createOffer();
            await peer.pc.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }

    async setRemoteDescription(socketId, answer) {
        const peer = this.peers.get(socketId);
        if (peer) {
            await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    addLocalStreamToPeer(socketId, stream) {
        const peer = this.peers.get(socketId);
        if (peer) {
            stream.getTracks().forEach(track => {
                peer.pc.addTrack(track, stream);
            });
        }
    }

    addLocalStream(stream) {
        this.peers.forEach(peer => {
            stream.getTracks().forEach(track => {
                peer.pc.addTrack(track, stream);
            });
        });
    }

    removePeer(socketId) {
        const peer = this.peers.get(socketId);
        if (peer) {
            peer.pc.close();
            this.peers.delete(socketId);
        }
    }

    closeAllPeers() {
        this.peers.forEach(peer => {
            peer.pc.close();
        });
        this.peers.clear();
    }
}

export default new PeerService();
