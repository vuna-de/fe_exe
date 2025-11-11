import React, { useEffect, useMemo, useState } from 'react';
import { WorkoutSession } from '../types';
import { completeWorkoutSession } from '../services/workoutService';
import { ClockIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import './WorkoutSessionModal.css';

interface Props {
  session: WorkoutSession;
  onClose: () => void;
  onCompleted: (updated: WorkoutSession) => void;
}

const WorkoutSessionModal: React.FC<Props> = ({ session, onClose, onCompleted }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [completedMap, setCompletedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setSeconds(0);
    setIsRunning(true);
    const t = setInterval(() => {
      setSeconds((s) => (isRunning ? s + 1 : s));
    }, 1000);
    return () => clearInterval(t);
  }, [session, isRunning]);

  const fmt = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }, [seconds]);

  const handleComplete = async () => {
    try {
      const res = await completeWorkoutSession(session._id as any);
      onCompleted(res.session);
      onClose();
    } catch (e) {
      console.error('Complete session error', e);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card session-card">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{session.name}</h2>
          <button className="close-btn" onClick={onClose} title="Đóng">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body">
          {/* Timer + Info */}
          <div className="session-top">
            <div className="timer-badge">{fmt}</div>
            <div className="info-text">
              <p className="font-semibold">{(session.exercises || []).length} bài tập</p>
              <p className="text-sm text-gray-500">Bấm hoàn thành khi xong phiên</p>
            </div>
            <div className="action-buttons">
              <button className="btn-outline" onClick={() => setIsRunning(v => !v)}>
                {isRunning ? 'Tạm dừng' : 'Tiếp tục'}
              </button>
              <button className="btn-primary" onClick={handleComplete}>Hoàn thành</button>
            </div>
          </div>

          {/* Progress */}
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min((seconds/60) / Math.max((session.totalDuration || 45), 1) * 100, 100)}%` }}
            />
          </div>

          {/* Exercise list */}
          <div className="section">
            <h3 className="section-title">Bài tập trong phiên</h3>
            <div className="exercise-list">
              {(session.exercises || []).map((ex: any, idx: number) => (
                <div key={idx} className={`exercise-item ${completedMap[idx] ? 'done' : ''}`}>
                  <div className="exercise-name">
                    <a
                      href={`/exercises?search=${encodeURIComponent(ex.exercise?.name || '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="link"
                    >
                      {ex.exercise?.name || 'Bài tập'}
                    </a>
                  </div>
                  <div className="exercise-detail">
                    {ex.plannedSets ? `${ex.plannedSets} sets` : ''}
                    {ex.plannedReps?.min ? ` • ${ex.plannedReps.min}-${ex.plannedReps.max} reps` : ''}
                    {ex.plannedDuration ? ` • ${Math.round(ex.plannedDuration/60)}'` : ''}
                  </div>
                  <button
                    className={`toggle-btn ${completedMap[idx] ? 'active' : ''}`}
                    onClick={() => setCompletedMap(m => ({ ...m, [idx]: !m[idx] }))}
                  >
                    {completedMap[idx] ? <CheckCircleIcon className="w-5 h-5" /> : 'Hoàn thành'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-actions">
            <button className="btn-outline" onClick={() => setIsRunning(v => !v)}>
              {isRunning ? 'Tạm dừng' : 'Tiếp tục'}
            </button>
            <button className="btn-primary" onClick={handleComplete}>Hoàn thành phiên</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutSessionModal;
