#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

in vec4 vs_Pos;
in vec4 vs_Col1;
in vec4 vs_Col2;
in vec4 vs_Col3;
in vec4 vs_Col4;

out vec2 fs_Pos;
out vec3 fs_Col;

void main() {
  fs_Pos = vs_Pos.xy;
  mat3 T = mat3(vec3(vs_Col1), vec3(vs_Col2), vec3(vs_Col3));
  vec3 p = vec3(vs_Pos.xy, 1.0);
  fs_Pos = vec2(T * p);
  fs_Col = vec3(0.0);
  gl_Position = vec4(fs_Pos.x, fs_Pos.y, vs_Pos.z, 1.0);
}
