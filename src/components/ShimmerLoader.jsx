// src/components/ShimmerLoader.jsx
import React from 'react';

const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

export function ShimmerLoader({ width = '100%', height = '20px', borderRadius = '8px', style = {} }) {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div
        style={{
          width,
          height,
          borderRadius,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
          backgroundSize: '1000px 100%',
          animation: 'shimmer 2s infinite linear',
          ...style,
        }}
      />
    </>
  );
}

export function ShimmerCard({ style = {} }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...style,
      }}
    >
      <ShimmerLoader width="60%" height="24px" style={{ marginBottom: '12px' }} />
      <ShimmerLoader width="100%" height="16px" style={{ marginBottom: '8px' }} />
      <ShimmerLoader width="80%" height="16px" />
    </div>
  );
}

export function ShimmerImage({ width = '100px', height = '100px', borderRadius = '50%', style = {} }) {
  return (
    <ShimmerLoader
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={style}
    />
  );
}
