/**
 * VideoMaskMaterial.jsx — The Shader Protocol
 * --------------------------------------------------------------------
 *  Custom ShaderMaterial that samples a video texture and masks out
 *  dark areas (e.g. the starry sky), blending them with a configurable
 *  background colour. Built with `shaderMaterial` from @react-three/drei
 *  so it can be used directly in JSX as `<videoMaskMaterial />`.
 *
 *  Uniforms:
 *    uTexture   : THREE.VideoTexture from useVideoTexture
 *    uBgColor   : THREE.Color used to paint the masked-out areas
 *    uThreshold : luminance below which pixels are considered "sky"
 *    uFeather   : softness of the mask edge (0 = hard cut, 1 = very soft)
 * --------------------------------------------------------------------
 */
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

const VideoMaskMaterial = shaderMaterial(
  {
    uTexture: null,
    uBgColor: new THREE.Color('#D4D3D0'),
    uThreshold: 0.5,
    uFeather: 0.06,
  },
  /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* glsl */ `
    uniform sampler2D uTexture;
    uniform vec3 uBgColor;
    uniform float uThreshold;
    uniform float uFeather;

    varying vec2 vUv;

    void main() {
      // 1. Sample the source frame.
      vec4 texColor = texture2D(uTexture, vUv);

      // 2. Compute luminance using Rec. 601 weights.
      //    Dark sky pixels collapse toward 0; lit subject pixels push toward 1.
      float luminance = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

      // 3. Build a soft alpha mask via smoothstep.
      //    Pixels below uThreshold are fully masked (sky);
      //    pixels above uThreshold + uFeather are fully visible (subject).
      float mask = smoothstep(uThreshold, uThreshold + uFeather, luminance);

      // 4. Blend: where the mask is 0 we paint uBgColor, where it's 1
      //    we keep the original video colour, with a soft transition between.
      vec3 finalColor = mix(uBgColor, texColor.rgb, mask);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
)

// Register the material class as a JSX element: <videoMaskMaterial />
extend({ VideoMaskMaterial })

export default VideoMaskMaterial
