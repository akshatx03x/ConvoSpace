// services/Peer.js
class PeerService {
  constructor() {
    this.peers = new Map(); // Map of socketId -> { pc, onStream }
  }

  createPeer(socketId, onStream, onNegotiationNeeded, onIceCandidate) {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478"
          ]
        }
        // Add TURN servers here for production, e.g.
        // { urls: "turn:your.turn.server:3478", username: "user", credential: "pass" }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event?.candidate) {
        if (onIceCandidate && typeof onIceCandidate === 'function') {
          onIceCandidate(event.candidate);
        } else {
          console.debug('ICE candidate produced but no onIceCandidate callback provided', event.candidate);
        }
      }
    };

    pc.ontrack = (event) => {
      // event.streams[0] is the received MediaStream
      if (onStream && event.streams && event.streams[0]) {
        onStream(event.streams[0]);
      } else {
        console.debug('ontrack fired but no onStream handler or streams missing');
      }
    };

    // Some browsers need onnegotiationneeded to be async and createOffer/answer handling
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
    } else {
      console.warn(`getAnswer: peer ${socketId} not found`);
    }
  }

  async getOffer(socketId) {
    const peer = this.peers.get(socketId);
    if (peer) {
      const offer = await peer.pc.createOffer();
      await peer.pc.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    } else {
      console.warn(`getOffer: peer ${socketId} not found`);
    }
  }

  async setRemoteDescription(socketId, answer) {
    const peer = this.peers.get(socketId);
    if (peer) {
      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
    } else {
      console.warn(`setRemoteDescription: peer ${socketId} not found`);
    }
  }

  addLocalStreamToPeer(socketId, stream) {
    const peer = this.peers.get(socketId);
    if (peer && stream) {
      try {
        stream.getTracks().forEach(track => {
          peer.pc.addTrack(track, stream);
        });
      } catch (err) {
        console.error('addLocalStreamToPeer error', err);
      }
    }
  }

  addLocalStream(stream) {
    if (!stream) return;
    this.peers.forEach(peer => {
      try {
        stream.getTracks().forEach(track => {
          peer.pc.addTrack(track, stream);
        });
      } catch (err) {
        console.error('addLocalStream error', err);
      }
    });
  }

  async addIceCandidate(socketId, candidate) {
    const peer = this.peers.get(socketId);
    if (peer) {
      try {
        if (candidate) {
          await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.warn('addIceCandidate failed for', socketId, err);
      }
    } else {
      console.warn(`addIceCandidate: peer ${socketId} not found`);
    }
  }

  removePeer(socketId) {
    const peer = this.peers.get(socketId);
    if (peer) {
      try {
        peer.pc.close();
      } catch (err) { /* ignore */ }
      this.peers.delete(socketId);
    }
  }

  closeAllPeers() {
    this.peers.forEach(peer => {
      try {
        peer.pc.close();
      } catch (err) { /* ignore */ }
    });
    this.peers.clear();
  }
}

export default new PeerService();
