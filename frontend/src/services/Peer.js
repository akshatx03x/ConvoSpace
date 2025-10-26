// services/Peer.js (FIXED)
class PeerService {
  constructor() {
    this.peers = new Map(); // Map of socketId -> { pc, onStream, remoteStream }
  }

  createPeer(socketId, onStream, onNegotiationNeeded, onIceCandidate) {
    // Don't create duplicate peer connections
    if (this.peers.has(socketId)) {
      console.warn(`Peer connection already exists for ${socketId}`);
      return this.peers.get(socketId).pc;
    }

    const configuration = {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302"
          ]
        }
        // For production, add TURN servers:
        // {
        //   urls: "turn:your.turn.server:3478",
        //   username: "user",
        //   credential: "pass"
        // }
      ],
      iceCandidatePoolSize: 10
    };

    const pc = new RTCPeerConnection(configuration);

    // ICE candidate handler
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate generated for', socketId, event.candidate.type);
        if (onIceCandidate && typeof onIceCandidate === 'function') {
          onIceCandidate(event.candidate);
        }
      }
    };

    // Connection state change handler
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${socketId}:`, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn(`Connection ${pc.connectionState} for ${socketId}`);
      }
      if (pc.connectionState === 'connected') {
        console.log(`✅ Successfully connected to ${socketId}`);
      }
    };

    // ICE connection state change handler
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${socketId}:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        console.error(`ICE connection failed for ${socketId}`);
        // Attempt ICE restart
        pc.restartIce();
      }
    };

    // ICE gathering state change handler
    pc.onicegatheringstatechange = () => {
      console.log(`ICE gathering state for ${socketId}:`, pc.iceGatheringState);
    };

    // Track handler - receives remote media
    pc.ontrack = (event) => {
      console.log('Received track from', socketId, event.track.kind);
      
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        
        // Store reference to remote stream
        const peerData = this.peers.get(socketId);
        if (peerData) {
          peerData.remoteStream = remoteStream;
        }

        // Call the callback with the stream
        if (onStream && typeof onStream === 'function') {
          onStream(remoteStream);
        }

        // Log track details
        console.log(`Stream from ${socketId}:`, {
          id: remoteStream.id,
          active: remoteStream.active,
          audioTracks: remoteStream.getAudioTracks().length,
          videoTracks: remoteStream.getVideoTracks().length
        });
      } else {
        console.warn('ontrack fired but no streams available');
      }
    };

    // Negotiation needed handler
    if (onNegotiationNeeded) {
      pc.onnegotiationneeded = async () => {
        console.log('Negotiation needed for', socketId);
        if (typeof onNegotiationNeeded === 'function') {
          try {
            await onNegotiationNeeded();
          } catch (err) {
            console.error('Negotiation needed handler error:', err);
          }
        }
      };
    }

    // Store peer connection
    this.peers.set(socketId, {
      pc,
      onStream,
      onNegotiationNeeded,
      onIceCandidate,
      remoteStream: null
    });

    console.log(`Created peer connection for ${socketId}`);
    return pc;
  }

  async getAnswer(socketId, offer) {
    const peer = this.peers.get(socketId);
    if (!peer) {
      console.error(`getAnswer: peer ${socketId} not found`);
      return null;
    }

    try {
      console.log(`Creating answer for ${socketId}`);
      
      // Set remote description (the offer)
      await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(`Set remote description (offer) for ${socketId}`);

      // Create answer
      const answer = await peer.pc.createAnswer();
      console.log(`Created answer for ${socketId}`);

      // Set local description (the answer)
      await peer.pc.setLocalDescription(answer);
      console.log(`Set local description (answer) for ${socketId}`);

      return answer;
    } catch (err) {
      console.error(`Error in getAnswer for ${socketId}:`, err);
      throw err;
    }
  }

  async getOffer(socketId) {
    const peer = this.peers.get(socketId);
    if (!peer) {
      console.error(`getOffer: peer ${socketId} not found`);
      return null;
    }

    try {
      console.log(`Creating offer for ${socketId}`);

      // Create offer with audio and video
      const offer = await peer.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      console.log(`Created offer for ${socketId}`);

      // Set local description (the offer)
      await peer.pc.setLocalDescription(offer);
      console.log(`Set local description (offer) for ${socketId}`);

      return offer;
    } catch (err) {
      console.error(`Error in getOffer for ${socketId}:`, err);
      throw err;
    }
  }

  async setRemoteDescription(socketId, answer) {
    const peer = this.peers.get(socketId);
    if (!peer) {
      console.error(`setRemoteDescription: peer ${socketId} not found`);
      return;
    }

    try {
      console.log(`Setting remote description (answer) for ${socketId}`);
      
      // Check if we're in the right state
      if (peer.pc.signalingState === 'stable') {
        console.warn(`Peer ${socketId} is already in stable state, skipping setRemoteDescription`);
        return;
      }

      await peer.pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log(`Set remote description (answer) for ${socketId}`);
    } catch (err) {
      console.error(`Error in setRemoteDescription for ${socketId}:`, err);
      // Don't throw - this can happen in race conditions
    }
  }

  addLocalStreamToPeer(socketId, stream) {
    const peer = this.peers.get(socketId);
    if (!peer || !stream) {
      console.error(`addLocalStreamToPeer: peer ${socketId} not found or no stream`);
      return;
    }

    try {
      const senders = peer.pc.getSenders();
      
      stream.getTracks().forEach(track => {
        // Check if track already added
        const existingSender = senders.find(sender => sender.track === track);
        if (!existingSender) {
          peer.pc.addTrack(track, stream);
          console.log(`Added ${track.kind} track to peer ${socketId}`);
        } else {
          console.log(`Track ${track.kind} already added to peer ${socketId}`);
        }
      });

      console.log(`Added local stream to peer ${socketId}:`, {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });
    } catch (err) {
      console.error(`Error in addLocalStreamToPeer for ${socketId}:`, err);
    }
  }

  addLocalStream(stream) {
    if (!stream) {
      console.error('addLocalStream: no stream provided');
      return;
    }

    console.log(`Adding local stream to all ${this.peers.size} peers`);
    
    this.peers.forEach((peer, socketId) => {
      this.addLocalStreamToPeer(socketId, stream);
    });
  }

  async addIceCandidate(socketId, candidate) {
    const peer = this.peers.get(socketId);
    if (!peer) {
      console.error(`addIceCandidate: peer ${socketId} not found`);
      return;
    }

    try {
      if (!candidate) {
        console.warn(`addIceCandidate: null candidate for ${socketId}`);
        return;
      }

      // Wait for remote description to be set before adding ICE candidates
      if (peer.pc.remoteDescription) {
        await peer.pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`Added ICE candidate for ${socketId}`);
      } else {
        console.warn(`Remote description not set yet for ${socketId}, cannot add ICE candidate`);
        // You might want to queue this candidate
      }
    } catch (err) {
      console.error(`Error adding ICE candidate for ${socketId}:`, err);
      // Don't throw - ICE candidate errors are often recoverable
    }
  }

  removePeer(socketId) {
    const peer = this.peers.get(socketId);
    if (!peer) {
      console.warn(`removePeer: peer ${socketId} not found`);
      return;
    }

    try {
      console.log(`Removing peer ${socketId}`);
      
      // Close the peer connection
      peer.pc.close();
      
      // Remove from map
      this.peers.delete(socketId);
      
      console.log(`Removed peer ${socketId}. Remaining peers: ${this.peers.size}`);
    } catch (err) {
      console.error(`Error removing peer ${socketId}:`, err);
    }
  }

  closeAllPeers() {
    console.log(`Closing all ${this.peers.size} peer connections`);
    
    this.peers.forEach((peer, socketId) => {
      try {
        peer.pc.close();
        console.log(`Closed peer ${socketId}`);
      } catch (err) {
        console.error(`Error closing peer ${socketId}:`, err);
      }
    });
    
    this.peers.clear();
    console.log('All peers closed');
  }

  // Utility method to check peer connection state
  getPeerState(socketId) {
    const peer = this.peers.get(socketId);
    if (!peer) {
      return null;
    }

    return {
      connectionState: peer.pc.connectionState,
      iceConnectionState: peer.pc.iceConnectionState,
      iceGatheringState: peer.pc.iceGatheringState,
      signalingState: peer.pc.signalingState,
      hasRemoteStream: !!peer.remoteStream
    };
  }

  // Utility method to get all peer states
  getAllPeerStates() {
    const states = {};
    this.peers.forEach((peer, socketId) => {
      states[socketId] = this.getPeerState(socketId);
    });
    return states;
  }
}

export default new PeerService();