class PeerService {
    constructor() {
        this.peers = new Map(); // Map of socketId to { pc, onStream }
    }

    createPeer(socketId, onStream, onNegotiationNeeded, onIceCandidate) {
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
            if (event.candidate && onIceCandidate) {
                onIceCandidate(event.candidate);
            }
        };

        pc.ontrack = (event) => {
            if (onStream) {
                onStream(event.streams[0]);
            }
        };

        pc.onnegotiationneeded = onNegotiationNeeded;

        this.peers.set(socketId, { pc, onStream, onNegotiationNeeded, onIceCandidate });
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

    async addIceCandidate(socketId, candidate) {
        const peer = this.peers.get(socketId);
        if (peer) {
            await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
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
