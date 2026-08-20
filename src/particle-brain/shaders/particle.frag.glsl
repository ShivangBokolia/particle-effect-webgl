varying vec3 vColor;

// Note: three.js auto-injects `colorspace_pars_fragment` (which defines
// `linearToOutputTexel`) into every non-raw ShaderMaterial's fragment shader
// prefix, so only the conversion call itself is needed here — including
// `colorspace_pars_fragment` again would redefine those functions/consts
// and fail to compile.
void main() {
  gl_FragColor = vec4(vColor, 1.0);
  #include <colorspace_fragment>
}
