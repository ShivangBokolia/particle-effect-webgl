uniform float uTime;
uniform vec3 uMouse;
uniform float uMouseInfluence;
uniform float uRepelStrength;
uniform float uRepelRadius;
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

  vec3 toParticle = aRestPosition - uMouse;
  float dist = length(toParticle);
  float falloff = clamp(1.0 - dist / uRepelRadius, 0.0, 1.0);
  falloff *= falloff;
  vec3 pushDir = dist > 0.0001 ? normalize(toParticle) : vec3(0.0, 1.0, 0.0);
  vec3 repelled = drifted + pushDir * uRepelStrength * falloff * uMouseInfluence;

  vec3 localOffset = position * uParticleSize;
  vec4 mvPosition = modelViewMatrix * vec4(repelled + localOffset, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
