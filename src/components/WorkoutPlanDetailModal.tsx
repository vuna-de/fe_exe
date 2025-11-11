import React from 'react';
import { WorkoutPlan } from '../types';
import { XMarkIcon, FireIcon, ClockIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import './WorkoutPlanDetailModal.css';

interface Props {
  plan: WorkoutPlan;
  onClose: () => void;
}

const WorkoutPlanDetailModal: React.FC<Props> = ({ plan, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-card detail-card">
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Chi tiết kế hoạch: {plan.name}</h2>
          <button className="close-btn" onClick={onClose} title="Đóng">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="modal-body">
          {/* Thông tin tổng quan */}
          <div className="info-grid">
            <div className="info-card">
              <ChartBarIcon className="icon" />
              <div>
                <p className="label">Danh mục</p>
                <p className="value">{plan.category}</p>
              </div>
            </div>
            <div className="info-card">
              <BoltIcon className="icon" />
              <div>
                <p className="label">Độ khó</p>
                <p className="value">{plan.difficulty}</p>
              </div>
            </div>
            <div className="info-card">
              <ClockIcon className="icon" />
              <div>
                <p className="label">Thời lượng</p>
                <p className="value">{plan.estimatedDuration} phút</p>
              </div>
            </div>
            <div className="info-card">
              <FireIcon className="icon" />
              <div>
                <p className="label">Calories</p>
                <p className="value">{plan.totalCalories} cal</p>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          {plan.description && (
            <div className="section">
              <h3 className="section-title">Mô tả</h3>
              <p className="section-content">{plan.description}</p>
            </div>
          )}

          {/* Danh sách bài tập */}
          <div className="section">
            <h3 className="section-title">Danh sách bài tập</h3>
            <div className="exercise-list">
              {(plan.exercises || []).map((ex: any, idx: number) => (
                <div key={idx} className="exercise-item">
                  <span className="exercise-name">{ex.exercise?.name || 'Bài tập'}</span>
                  <span className="exercise-detail">
                    {ex.plannedSets ? `${ex.plannedSets} sets` : ''}
                    {ex.plannedReps?.min ? ` • ${ex.plannedReps.min}-${ex.plannedReps.max} reps` : ''}
                    {ex.plannedDuration ? ` • ${Math.round(ex.plannedDuration / 60)}'` : ''}
                  </span>
                </div>
              ))}
              {(!plan.exercises || plan.exercises.length === 0) && (
                <div className="empty">Kế hoạch chưa có bài tập.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanDetailModal;
