import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { C, FONT_MONO, rgb } from '../../theme/tokens';

/**
 * TimelineLayer — ghost trails showing production flow over the current shift.
 * Renders fading trail particles that replay the last 8 hours of material movement.
 * A time indicator shows the current shift position.
 */

const TRAIL_SEGMENTS = 60;
const TRAIL_POINTS_ORDER = ['bf', 'sms', 'cc', 'rm', 'ql'];

// Shift events — key moments visualized as markers on the trail
const SHIFT_EVENTS = [
  { time: 0.15, label: '06:00 Shift start', type: 'normal' },
  { time: 0.35, label: '09:20 BF-3 deviation', type: 'alert' },
  { time: 0.55, label: '11:00 Gap opens', type: 'alert' },
  { time: 0.72, label: '13:30 CCM-3 slowdown', type: 'alert' },
  { time: 0.90, label: '15:00 Current', type: 'now' },
];

function createTrailCurve(zonePositions) {
  const points = TRAIL_POINTS_ORDER
    .map(id => zonePositions[id])
    .filter(Boolean)
    .map(p => new THREE.Vector3(p[0], p[1] + 1.5, p[2]));

  if (points.length < 2) return null;
  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.5);
}

function ShiftMarker({ position, event }) {
  const isAlert = event.type === 'alert';
  const isNow = event.type === 'now';
  const color = isNow ? C.cyan : isAlert ? C.red : C.t3;

  return (
    <group position={position}>
      {/* Marker dot */}
      <mesh>
        <sphereGeometry args={[isNow ? 0.2 : 0.12, 8, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isNow ? 1 : 0.6}
        />
      </mesh>

      {/* Label */}
      <Html
        position={[0, 1, 0]}
        center
        distanceFactor={20}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 8,
          color: color,
          background: `${C.bg}dd`,
          padding: '2px 6px',
          borderRadius: 3,
          whiteSpace: 'nowrap',
          border: `1px solid ${rgb(color, 0.2)}`,
        }}>
          {event.label}
        </div>
      </Html>
    </group>
  );
}

export default function TimelineLayer({ zonePositions }) {
  const trailRef = useRef();
  const curve = useMemo(() => createTrailCurve(zonePositions), [zonePositions]);

  // Generate trail geometry — a tube that fades with opacity
  const trailPoints = useMemo(() => {
    if (!curve) return [];
    return curve.getPoints(TRAIL_SEGMENTS);
  }, [curve]);

  // Animate a "playhead" traveling along the trail
  const playheadRef = useRef();
  useFrame(({ clock }) => {
    if (!playheadRef.current || !curve) return;
    const t = clock.getElapsedTime();
    // Playhead oscillates back and forth slowly
    const u = 0.5 + 0.45 * Math.sin(t * 0.2);
    const point = curve.getPointAt(u);
    playheadRef.current.position.copy(point);
  });

  if (!curve) return null;

  // Place shift events along the curve
  const eventPositions = SHIFT_EVENTS.map(evt => ({
    ...evt,
    point: curve.getPointAt(Math.min(evt.time, 0.999)),
  }));

  return (
    <group>
      {/* Ghost trail line */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(trailPoints.flatMap(p => [p.x, p.y, p.z]))}
            count={trailPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={C.purple} transparent opacity={0.25} />
      </line>

      {/* Thicker ghost trail — dashed */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={new Float32Array(trailPoints.flatMap(p => [p.x, p.y + 0.01, p.z]))}
            count={trailPoints.length}
            itemSize={3}
          />
        </bufferGeometry>
        <lineDashedMaterial
          color={C.purple}
          transparent
          opacity={0.12}
          dashSize={0.5}
          gapSize={0.3}
        />
      </line>

      {/* Shift event markers */}
      {eventPositions.map((evt, i) => (
        <ShiftMarker
          key={i}
          position={[evt.point.x, evt.point.y, evt.point.z]}
          event={evt}
        />
      ))}

      {/* Animated playhead */}
      <mesh ref={playheadRef}>
        <sphereGeometry args={[0.25, 12, 12]} />
        <meshBasicMaterial
          color={C.purple}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
