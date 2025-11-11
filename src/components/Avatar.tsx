import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackName?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'Avatar', 
  size = 128, 
  className = '',
  fallbackName = 'User'
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=2563eb&color=fff&size=${size}`;

  const handleError = () => {
    console.log('❌ Avatar load failed, using fallback');
    setError(true);
    setLoading(false);
  };

  const handleLoad = () => {
    console.log('✅ Avatar loaded successfully');
    setLoading(false);
  };

  // Nếu không có src hoặc có lỗi, dùng fallback
  const imageSrc = !src || error ? fallbackUrl : src;

  console.log('🖼️ Avatar component:', { src, imageSrc, error, loading });

  return (
    <img
      className={className}
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      style={loading ? { opacity: 0.5 } : {}}
    />
  );
};

export default Avatar;
