import React, { useEffect, useState } from 'react';
import { listTrainers, listConnections, requestConnection, cancelConnection } from '../services/ptService';

const PTDirectory: React.FC = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [t, c] = await Promise.all([listTrainers(), listConnections()]);
      setTrainers(t.trainers || []);
      setConnections(c.connections || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getAvatar = (name?: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Trainer')}&background=0ea5e9&color=fff`;

  const handleConnect = async (trainerId: string) => {
    await requestConnection(trainerId);
    await load();
  };

  const handleCancel = async (connectionId: string) => {
    await cancelConnection(connectionId);
    await load();
  };

  const getConnectionForTrainer = (trainerId: string) => connections.find((c: any) => c.trainer?._id === trainerId);

  return (
    <div className="p-6">
      <div className="welcome-section mb-4">
        <h1 className="welcome-title">Danh sách Huấn luyện viên</h1>
        <p className="welcome-subtitle">Kết nối PT để nhận hướng dẫn 1-on-1</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : (
        <div className="p-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1rem' }}>
          {trainers.map((t) => {
            const conn = getConnectionForTrainer(t._id);
            const connected = conn?.status === 'active';
            const pending = conn?.status === 'pending';
            return (
              <div key={t._id} className="workout-card" style={{ padding: '1rem' }}>
                <div className="flex items-center" style={{ gap: '0.75rem' }}>
                  <img className="chat-avatar" src={getAvatar(t.user?.fullName)} alt={t.user?.fullName || 'Trainer'} />
                  <div>
                    <div className="text-sm font-semibold">{t.user?.fullName || 'Trainer'}</div>
                    <div className="text-xs text-gray-600">Rating: {t.rating?.toFixed(1) || 5}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700" style={{ margin: '0.5rem 0' }}>{t.bio}</p>
                <div className="flex" style={{ gap: '0.5rem' }}>
                  {!connected && !pending && (
                    <button className="btn btn-primary" onClick={() => handleConnect(t._id)}>Kết nối</button>
                  )}
                  {pending && (
                    <>
                      <button className="btn btn-outline" disabled>Đang chờ</button>
                      {conn?._id && <button className="btn btn-outline" onClick={() => handleCancel(conn._id)}>Huỷ</button>}
                    </>
                  )}
                  {connected && conn?._id && (
                    <>
                      <button className="btn btn-outline" onClick={() => handleCancel(conn._id)}>Huỷ kết nối</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PTDirectory;


