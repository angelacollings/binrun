import { ImageResponse } from 'next/og';

export const contentType = 'image/png';
export const size = {
  height: 180,
  width: 180,
};

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background: '#fffefa',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', height: 92, position: 'relative', width: 124 }}>
        <div
          style={{
            borderBottom: '11px solid #183f32',
            borderBottomLeftRadius: 28,
            borderLeft: '11px solid #183f32',
            display: 'flex',
            height: 72,
            left: 0,
            position: 'absolute',
            top: 0,
            width: 108,
          }}
        />
        <div
          style={{
            background: '#183f32',
            borderRadius: 999,
            display: 'flex',
            height: 11,
            left: 25,
            position: 'absolute',
            top: 0,
            width: 62,
          }}
        />
        <div
          style={{
            background: '#b9812f',
            borderRadius: 999,
            bottom: 0,
            display: 'flex',
            height: 32,
            position: 'absolute',
            right: 0,
            width: 32,
          }}
        />
      </div>
    </div>,
    size
  );
}
