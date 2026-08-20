uniform float uTime;
uniform float uParticleSize;

attribute vec3 aRestPosition;
attribute vec3 aColor;
attribute float aSeed;

varying vec3 vColor;

void main() {
  vColor = aColor;

  float driftX = sin(uTime * 0.6 + aSeed * 6.2831853) * 0.02;
  float driftY = cos(uTime * 0.5 + aSeed * 9.4247780) * 0.02;
  float driftZ = sin(uTime * 0.4 + aSeed * 3.1415927) * 0.02;
  vec3 drifted = aRestPosition + vec3(driftX, driftY, driftZ);

  vec3 localOffset = position * uParticleSize;
  vec4 mvPosition = modelViewMatrix * vec4(drifted + localOffset, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
