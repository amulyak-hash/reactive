import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

/**
 * Holographic / skeletal shader:
 * - Fresnel-edge glow (cyan rim light)
 * - Animated scan-lines sweeping upward
 * - Wireframe overlay with emissive edges
 * - Subtle flicker / noise
 * - Transparent interior, opaque edges
 */

const HoloShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#00e5ff'),
    uFresnelPower: 2.0,
    uScanSpeed: 0.4,
    uScanDensity: 80.0,
    uOpacity: 0.12,
    uEdgeOpacity: 0.85,
    uFlickerSpeed: 8.0,
  },
  // vertex
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec3 vViewDir;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      vViewDir = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  // fragment
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uFresnelPower;
    uniform float uScanSpeed;
    uniform float uScanDensity;
    uniform float uOpacity;
    uniform float uEdgeOpacity;
    uniform float uFlickerSpeed;

    varying vec3 vNormal;
    varying vec3 vWorldPos;
    varying vec3 vViewDir;
    varying vec2 vUv;

    // Simple hash-based noise
    float hash(float n) { return fract(sin(n) * 43758.5453123); }

    void main() {
      // --- Fresnel rim ---
      float fresnel = 1.0 - abs(dot(vViewDir, vNormal));
      fresnel = pow(fresnel, uFresnelPower);

      // --- Scan lines ---
      float scanLine = sin((vWorldPos.y + uTime * uScanSpeed) * uScanDensity) * 0.5 + 0.5;
      scanLine = smoothstep(0.3, 0.7, scanLine);

      // --- Moving scan band ---
      float scanBand = smoothstep(0.0, 2.0, sin(vWorldPos.y * 0.5 - uTime * 0.8) * 0.5 + 0.5);

      // --- Flicker ---
      float flicker = 0.92 + 0.08 * sin(uTime * uFlickerSpeed + hash(floor(uTime * 3.0)) * 6.28);

      // --- Combine ---
      float edgeGlow = fresnel * uEdgeOpacity;
      float interior = uOpacity * scanLine * 0.5;
      float alpha = clamp(edgeGlow + interior + scanBand * 0.15, 0.0, 1.0) * flicker;

      // Tint: brighter at edges, dimmer inside
      vec3 col = uColor * (0.4 + fresnel * 0.8 + scanBand * 0.3);

      gl_FragColor = vec4(col, alpha);
    }
  `
);

extend({ HoloShaderMaterial });

export default HoloShaderMaterial;
