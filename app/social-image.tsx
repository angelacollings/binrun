import { ImageResponse } from 'next/og';

export const socialImageAlt =
  'BinRun — wheelie bin set-out, return, and cleaning services in Whangarei';
export const socialImageSize = {
  height: 630,
  width: 1200,
};

function BrandMark() {
  return (
    <div
      style={{
        display: 'flex',
        height: 58,
        position: 'relative',
        width: 78,
      }}
    >
      <div
        style={{
          borderBottom: '7px solid #183f32',
          borderBottomLeftRadius: 20,
          borderLeft: '7px solid #183f32',
          display: 'flex',
          height: 46,
          left: 0,
          position: 'absolute',
          top: 0,
          width: 68,
        }}
      />
      <div
        style={{
          background: '#183f32',
          borderRadius: 999,
          display: 'flex',
          height: 7,
          left: 16,
          position: 'absolute',
          top: 0,
          width: 39,
        }}
      />
      <div
        style={{
          background: '#b9812f',
          borderRadius: 999,
          bottom: 0,
          display: 'flex',
          height: 20,
          position: 'absolute',
          right: 0,
          width: 20,
        }}
      />
    </div>
  );
}

export function createSocialImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#f7f6f1',
        color: '#151917',
        display: 'flex',
        fontFamily: 'Arial, Helvetica, sans-serif',
        height: '100%',
        padding: 54,
        width: '100%',
      }}
    >
      <div
        style={{
          alignItems: 'stretch',
          border: '2px solid #ddd8cb',
          borderRadius: 18,
          display: 'flex',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          style={{
            background: '#fffefa',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '52px 58px',
            width: '68%',
          }}
        >
          <div style={{ alignItems: 'center', display: 'flex', gap: 20 }}>
            <BrandMark />
            <span style={{ fontSize: 38, fontWeight: 900 }}>BinRun</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <span
              style={{
                alignSelf: 'flex-start',
                background: '#f5ead8',
                border: '1px solid rgba(185, 129, 47, 0.3)',
                borderRadius: 999,
                color: '#725018',
                fontSize: 18,
                fontWeight: 800,
                padding: '10px 16px',
              }}
            >
              WHANGAREI PROPERTY SERVICE
            </span>
            <strong
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: 58,
                letterSpacing: -2,
                lineHeight: 1.02,
              }}
            >
              <span>Bin day handled,</span>
              <span>every week.</span>
            </strong>
            <span style={{ color: '#5f6863', fontSize: 24, lineHeight: 1.45 }}>
              Set-out, return, and bin cleaning for homes, rentals, and busy households.
            </span>
          </div>
        </div>
        <div
          style={{
            background: '#0f2d24',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '58px 44px',
            width: '32%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ color: 'rgba(255,255,255,0.62)', fontSize: 17, fontWeight: 800 }}>
              SIMPLE SERVICE
            </span>
            <strong style={{ fontSize: 35, lineHeight: 1.08 }}>One less job to manage.</strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Set out', 'Return', 'Wash options'].map((item) => (
              <span
                key={item}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.13)',
                  borderRadius: 10,
                  fontSize: 23,
                  fontWeight: 700,
                  padding: '16px 18px',
                }}
              >
                {item}
              </span>
            ))}
          </div>
          <span style={{ color: 'rgba(255,255,255,0.68)', fontSize: 19 }}>binrun.co.nz</span>
        </div>
      </div>
    </div>,
    socialImageSize
  );
}
