import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { listTrainers, requestConnection, getMessages, sendMessage, acceptConnection, cancelConnection, listConnections, listTrainerConnections } from '../services/ptService';
import { useAuth } from '../store/authStore';
import './PTPage.css';

const PTPage: React.FC = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [activeConnection, setActiveConnection] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
  const [inCall, setInCall] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callStartAt, setCallStartAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<string>('00:00');
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);

  const { user } = useAuth();

  const load = async () => {
    try {
      let data;
      if (user?.role === 'trainer') {
        data = await listTrainerConnections();
      } else {
        const t = await listTrainers();
        setTrainers(t.trainers || []);
        data = await listConnections();
      }
      setConnections(data.connections || []);
      if (data.connections?.[0]?._id) {
        setActiveConnection(data.connections[0]._id);
      }
    } catch (e) {
      console.error('load PT data error', e);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let timer: any;
    const poll = async () => {
      if (!activeConnection) return;
      try {
        const res = await getMessages(activeConnection);
        setMessages(res.messages || []);
      } catch {}
      timer = setTimeout(poll, 3000);
    };
    poll();
    return () => { if (timer) clearTimeout(timer); };
  }, [activeConnection]);

  useEffect(() => {
    // auto scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Signaling setup when selecting a connection
  useEffect(() => {
    // Khởi tạo socket nếu chưa có
    if (!socketRef.current) {
      socketRef.current = io('/pt-call');
      const s = socketRef.current;
      s.on('offer', async ({ connectionId, sdp }: { connectionId: string; sdp: RTCSessionDescriptionInit }) => {
        // Chọn đúng cuộc trò chuyện và hiển thị popup
        setActiveConnection(connectionId);
        setIncoming(true);
        setPendingOffer(sdp);
      });
      s.on('answer', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        if (!pcRef.current) return;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      });
      s.on('ice', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        try { await pcRef.current?.addIceCandidate(candidate); } catch {}
      });
      s.on('end', () => { endCall(); });
    }
    return () => { /* giữ socket sống xuyên suốt trang */ };
  }, []);

  // Join tất cả rooms của user (để nhận cuộc gọi kể cả khi chưa mở đúng chat)
  useEffect(() => {
    if (!socketRef.current) return;
    connections.forEach((c: any) => {
      socketRef.current!.emit('join', { connectionId: c._id });
    });
  }, [connections]);

  const ensurePeerConnection = async () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;
    pc.onicecandidate = (e) => {
      if (e.candidate) socketRef.current?.emit('ice', { connectionId: activeConnection, candidate: e.candidate });
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };
    return pc;
  };

  const startCall = async (withVideo: boolean) => {
    if (!activeConnection || inCall) return;
    const constraints = withVideo ? { audio: true, video: { width: 640, height: 360 } } : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints as any);
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    await ensurePeerConnection();
    // Only add tracks if not already added
    const senders = pcRef.current!.getSenders();
    stream.getTracks().forEach((track) => {
      const already = senders.find((s) => s.track && s.track.kind === track.kind);
      if (!already) pcRef.current!.addTrack(track, stream);
    });
    const offer = await pcRef.current!.createOffer();
    await pcRef.current!.setLocalDescription(offer);
    socketRef.current?.emit('offer', { connectionId: activeConnection, sdp: pcRef.current!.localDescription });
    setInCall(true);
    setShowCallModal(true);
    setCallStartAt(Date.now());
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!callStartAt) return;
      const diff = Math.floor((Date.now() - callStartAt) / 1000);
      const mm = String(Math.floor(diff / 60)).padStart(2, '0');
      const ss = String(diff % 60).padStart(2, '0');
      setElapsed(`${mm}:${ss}`);
    }, 1000);
  };

  const endCall = () => {
    socketRef.current?.emit('end', { connectionId: activeConnection });
    pcRef.current?.getSenders().forEach((s) => s.track && s.track.stop());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    pcRef.current?.close();
    pcRef.current = null;
    setInCall(false);
    setShowCallModal(false);
    setCallStartAt(null);
    setElapsed('00:00');
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const acceptIncoming = async (withVideo: boolean) => {
    if (!activeConnection || !pendingOffer) return;
    const constraints = withVideo ? { audio: true, video: { width: 640, height: 360 } } : { audio: true, video: false };
    const stream = await navigator.mediaDevices.getUserMedia(constraints as any);
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    await ensurePeerConnection();
    const senders = pcRef.current!.getSenders();
    stream.getTracks().forEach((track) => {
      const already = senders.find((s) => s.track && s.track.kind === track.kind);
      if (!already) pcRef.current!.addTrack(track, stream);
    });
    await pcRef.current!.setRemoteDescription(new RTCSessionDescription(pendingOffer));
    const answer = await pcRef.current!.createAnswer();
    await pcRef.current!.setLocalDescription(answer);
    socketRef.current?.emit('answer', { connectionId: activeConnection, sdp: pcRef.current!.localDescription });
    setIncoming(false);
    setPendingOffer(null);
    setInCall(true);
    setShowCallModal(true);
    setCallStartAt(Date.now());
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!callStartAt) return;
      const diff = Math.floor((Date.now() - callStartAt) / 1000);
      const mm = String(Math.floor(diff / 60)).padStart(2, '0');
      const ss = String(diff % 60).padStart(2, '0');
      setElapsed(`${mm}:${ss}`);
    }, 1000);
  };

  const declineIncoming = () => {
    setIncoming(false);
    setPendingOffer(null);
    socketRef.current?.emit('end', { connectionId: activeConnection });
  };

  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()?.[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setMicMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()?.[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setCamOff(!videoTrack.enabled);
  };

  const reconnect = async () => {
    if (!activeConnection) return;
    try {
      pcRef.current?.close();
      pcRef.current = null;
      await ensurePeerConnection();
      // re-add local tracks if any
      if (localStreamRef.current) {
        const senders = pcRef.current!.getSenders();
        localStreamRef.current.getTracks().forEach((track) => {
          const already = senders.find((s) => s.track && s.track.kind === track.kind);
          if (!already) pcRef.current!.addTrack(track, localStreamRef.current!);
        });
      }
      const offer = await pcRef.current!.createOffer();
      await pcRef.current!.setLocalDescription(offer);
      socketRef.current?.emit('offer', { connectionId: activeConnection, sdp: pcRef.current!.localDescription });
    } catch (e) {
      console.error('reconnect error', e);
    }
  };

  const handleConnect = async (trainerId: string) => {
    try {
      // chặn nếu đã có kết nối/đang pending
      const has = connections.some((c: any) => c.trainer?._id === trainerId && ['pending','active'].includes(c.status));
      if (has) return;
      await requestConnection(trainerId);
      await load();
    } catch (e) {
      console.error('request connect error', e);
      await load();
    }
  };

  const handleSend = async () => {
    if (!activeConnection || !text.trim()) return;
    await sendMessage(activeConnection, text.trim());
    setText('');
    const res = await getMessages(activeConnection);
    setMessages(res.messages || []);
  };

  const handleAccept = async (connectionId: string) => {
    await acceptConnection(connectionId);
    await load();
  };

  const handleDecline = async (connectionId: string) => {
    await cancelConnection(connectionId);
    await load();
  };

  const activeTitle = (() => {
    const c: any = connections.find((x: any) => x._id === activeConnection);
    if (!c) return '';
    return user?.role === 'trainer' ? (c.user?.fullName || 'Khách hàng') : (c.trainer?.user?.fullName || 'Trainer');
  })();

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        {user?.role === 'trainer' ? (
          <>
            <div className="chat-sidebar-title">Khách hàng</div>
            <div className="chat-list">
              {connections.map((c: any) => (
                <div key={c._id} className={`chat-item ${activeConnection === c._id ? 'active' : ''}`} onClick={() => setActiveConnection(c._id)}>
                  <img className="chat-avatar" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.fullName || 'User')}&background=0ea5e9&color=fff`} alt={c.user?.fullName || 'User'} />
                  <div className="chat-meta">
                    <div className="chat-name">{c.user?.fullName || 'Khách hàng'}</div>
                    <div className="chat-sub">Trạng thái: {c.status}</div>
                  </div>
                  {c.status === 'pending' && (
                    <div style={{ marginLeft:'auto', display:'flex', gap:'0.25rem' }} onClick={(e) => e.stopPropagation()}>
                      <button className="chat-connect-btn" onClick={() => handleAccept(c._id)}>Chấp nhận</button>
                      <button className="btn btn-outline" onClick={() => handleDecline(c._id)}>Từ chối</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="chat-sidebar-title">Huấn luyện viên</div>
            <div className="chat-list">
              {trainers.map((t) => {
                const conn = connections.find((c: any) => c.trainer?._id === t._id && ['pending','active'].includes(c.status));
                const connected = !!conn && conn.status === 'active';
                const pending = !!conn && conn.status === 'pending';
                return (
                  <div key={t._id} className="chat-item" onClick={() => conn && setActiveConnection(conn._id)}>
                    <img className="chat-avatar" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.user?.fullName || 'Trainer')}&background=0ea5e9&color=fff`} alt={t.user?.fullName || 'Trainer'} />
                    <div className="chat-meta">
                      <div className="chat-name">{t.user?.fullName || 'Trainer'}</div>
                      <div className="chat-sub">{connected ? 'Đã kết nối' : pending ? 'Đang chờ' : 'Chưa kết nối'}</div>
                    </div>
                    {!connected && (
                      <button className="chat-connect-btn" onClick={(e) => { e.stopPropagation(); handleConnect(t._id); }}>{pending ? 'Chờ' : 'Kết nối'}</button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      {incoming && (
        <div className="modal-overlay" onClick={declineIncoming}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ gap:'0.5rem' }}>
              <div className="chat-name">Cuộc gọi đến từ {activeTitle}</div>
              <div style={{ marginLeft:'auto', display:'flex', gap:'0.5rem' }}>
                <button className="btn btn-primary" onClick={() => acceptIncoming(false)}>Trả lời (Thoại)</button>
                <button className="btn btn-primary" onClick={() => acceptIncoming(true)}>Trả lời (Video)</button>
                <button className="btn btn-outline" onClick={declineIncoming}>Từ chối</button>
              </div>
            </div>
            <div className="modal-body">
              <p>Ai đó đang gọi cho bạn...</p>
            </div>
          </div>
        </div>
      )}

      <div className="chat-panel">
        <div className="chat-header">
          <img className="chat-avatar" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeTitle || 'User')}&background=0ea5e9&color=fff`} alt={activeTitle || 'User'} />
          <div className="chat-header-meta">
            <div className="chat-name">{activeTitle || 'Chọn cuộc trò chuyện'}</div>
            {activeConnection && <div className="chat-sub">Đang hoạt động</div>}
          </div>
          {activeConnection && (
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              {!inCall ? (
                <>
                  <button className="btn btn-primary" onClick={() => startCall(false)}>Gọi thoại</button>
                  <button className="btn btn-primary" onClick={() => startCall(true)}>Gọi video</button>
                </>
              ) : (
                <button className="btn btn-outline" onClick={endCall}>Kết thúc</button>
              )}
            </div>
          )}
        </div>
        <div className="chat-messages">
          {messages.map((m) => {
            const mine = user?.role === 'trainer' ? m.senderType === 'trainer' : m.senderType === 'user';
            return (
              <div key={m._id} className={`chat-row ${mine ? 'mine' : ''}`}>
                {!mine && <img className="chat-avatar small" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activeTitle || 'User')}&background=0ea5e9&color=fff`} alt={activeTitle || 'User'} />}
                <div className={`chat-bubble ${mine ? 'mine' : 'theirs'}`}>
                  <div className="chat-text">{m.text}</div>
                  <div className="chat-time">{new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <input 
            className="chat-input-input" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSend(); } }}
            placeholder="Nhập tin nhắn..."
          />
          <button className="btn btn-primary" onClick={handleSend}>Gửi</button>
        </div>
      </div>
      {showCallModal && (
        <div className="modal-overlay" onClick={endCall}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ gap:'0.5rem' }}>
              <div className="chat-name">Cuộc gọi {activeTitle}</div>
              <div className="call-timer">{elapsed}</div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-outline" onClick={toggleMute}>{micMuted ? 'Unmute' : 'Mute'}</button>
                <button className="btn btn-outline" onClick={toggleCamera}>{camOff ? 'Camera on' : 'Camera off'}</button>
                <button className="btn btn-primary" onClick={reconnect}>Kết nối lại</button>
                <button className="btn btn-outline" onClick={endCall}>Kết thúc</button>
              </div>
            </div>
            <div className="modal-body" style={{ display:'flex', gap:'0.75rem' }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '12px', background: '#000' }} />
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '220px', borderRadius: '12px', background: '#000' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTPage;


