/* ─────────────────────────────────────────────────────────────
   Fondo global — "Hologram Glitch" adaptado a Sin Rueda Tecnológica
   Fuente: radiant-shaders.com/shader/hologram-glitch (MIT, pbakaus/radiant)
   Adaptaciones: paleta azul→cyan de marca, glitch atenuado para ambiente,
   render a baja resolución, sin tracking de mouse, respeto a reduced-motion,
   pausa en pestaña oculta y degradación elegante sin WebGL.
   ───────────────────────────────────────────────────────────── */
(function () {
  var canvas = document.getElementById("bg-shader");
  if (!canvas) return;

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) { canvas.style.display = "none"; return; }

  var gl = canvas.getContext("webgl", { alpha: true, antialias: false, preserveDrawingBuffer: false });
  if (!gl) { canvas.style.display = "none"; return; } // fallback: fondo sólido

  // Render a baja resolución para rendimiento (fondo ambiente, no necesita nitidez)
  var pixelScale = 2.2;

  // Intensidades atenuadas vs. el original (ambiente, no protagonista)
  var GLITCH_INTENSITY = 0.45;
  var SCAN_SPEED = 0.7;

  var vertSrc = [
    "attribute vec2 a_pos;",
    "void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }"
  ].join("\n");

  var fragSrc = [
    "precision highp float;",
    "uniform float u_time;",
    "uniform vec2 u_res;",
    "uniform float u_glitchIntensity;",
    "uniform float u_scanSpeed;",
    "",
    "#define PI 3.14159265359",
    "",
    "float hash(float n){ return fract(sin(n)*43758.5453123); }",
    "float hash2(vec2 p){ vec3 p3=fract(vec3(p.xyx)*0.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }",
    "",
    "float vnoise(vec2 p){",
    "  vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);",
    "  return mix(mix(hash2(i),hash2(i+vec2(1.0,0.0)),f.x),",
    "             mix(hash2(i+vec2(0.0,1.0)),hash2(i+vec2(1.0,1.0)),f.x), f.y);",
    "}",
    "",
    "float fbm(vec2 p){",
    "  float v=0.0; float a=0.5; vec2 shift=vec2(100.0);",
    "  mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));",
    "  for(int i=0;i<4;i++){ v+=a*vnoise(p); p=rot*p*2.0+shift; a*=0.5; }",
    "  return v;",
    "}",
    "",
    "float glitchEnvelope(float t){",
    "  float slow=sin(t*0.7)*sin(t*1.1);",
    "  float med=sin(t*3.3)*0.5+0.5;",
    "  float fast=step(0.92, hash(floor(t*12.0)));",
    "  float envelope=smoothstep(0.15,0.5,slow)*(0.5+0.5*med);",
    "  envelope+=fast*0.5;",
    "  return clamp(envelope,0.0,1.0);",
    "}",
    "",
    "float glitchBand(float y,float t,float intensity){",
    "  float env=glitchEnvelope(t);",
    "  if(env<0.1) return 0.0;",
    "  float band1=step(0.85,vnoise(vec2(y*15.0,floor(t*8.0))))*0.10;",
    "  float band3=step(0.85,vnoise(vec2(y*5.0,floor(t*4.0))))*0.18;",
    "  float dir=sign(vnoise(vec2(y*20.0,floor(t*6.0)))-0.5);",
    "  return (band1+band3)*dir*env*intensity;",
    "}",
    "",
    "void main(){",
    "  vec2 uv=gl_FragCoord.xy/u_res;",
    "  vec2 centeredUV=(gl_FragCoord.xy-u_res*0.5)/u_res.y;",
    "  float t=u_time;",
    "  float glitchI=u_glitchIntensity;",
    "  float scanS=u_scanSpeed;",
    "",
    "  // desplazamiento de bandas glitch",
    "  float bandOffset=glitchBand(uv.y,t,glitchI);",
    "  vec2 glitchedUV=uv; glitchedUV.x+=bandOffset;",
    "",
    "  // aberración cromática (sutil)",
    "  float chromBase=0.004+0.003*sin(t*1.2);",
    "  float chromSpike=glitchEnvelope(t)*0.018*glitchI;",
    "  float chromAmount=chromBase+chromSpike;",
    "  vec2 uvR=glitchedUV+vec2(-chromAmount,0.0);",
    "  vec2 uvG=glitchedUV;",
    "  vec2 uvB=glitchedUV+vec2(chromAmount,0.0);",
    "",
    "  float slowT=t*0.15;",
    "  float patR=fbm(uvR*3.0+vec2(slowT,slowT*0.7))+fbm(uvR*1.5+vec2(slowT*0.3,-slowT*0.4))*0.7+fbm(uvR*6.0+vec2(slowT*1.2,-slowT*0.6))*0.25;",
    "  float patG=fbm(uvG*3.0+vec2(slowT,slowT*0.7))+fbm(uvG*1.5+vec2(slowT*0.3,-slowT*0.4))*0.7+fbm(uvG*6.0+vec2(slowT*1.2,-slowT*0.6))*0.25;",
    "  float patB=fbm(uvB*3.0+vec2(slowT,slowT*0.7))+fbm(uvB*1.5+vec2(slowT*0.3,-slowT*0.4))*0.7+fbm(uvB*6.0+vec2(slowT*1.2,-slowT*0.6))*0.25;",
    "  patR/=1.95; patG/=1.95; patB/=1.95;",
    "  patR=smoothstep(0.35,0.62,patR); patG=smoothstep(0.35,0.62,patG); patB=smoothstep(0.35,0.62,patB);",
    "",
    "  // ── Paleta de MARCA: azul eléctrico → cyan (sin magenta/amarillo) ──",
    "  float hueShift=t*0.18;",
    "  float spatialHue=sin(centeredUV.x*3.5+centeredUV.y*2.5+t*0.25)*0.5+0.5;",
    "  vec3 colBlue =vec3(0.10,0.45,1.15);  // azul eléctrico",
    "  vec3 colCyan =vec3(0.15,0.95,1.20);  // cyan",
    "  vec3 colDeep =vec3(0.05,0.18,0.55);  // azul profundo",
    "  vec3 palette=mix(colDeep,colBlue, sin(hueShift)*0.5+0.5);",
    "  palette=mix(palette,colCyan, spatialHue*0.7);",
    "",
    "  vec3 baseColor;",
    "  baseColor.r=patR*palette.r;",
    "  baseColor.g=patG*palette.g;",
    "  baseColor.b=patB*palette.b;",
    "",
    "  float alignment=patR*patG*patB;",
    "  baseColor+=vec3(0.6,0.85,1.0)*pow(alignment,1.6)*0.9;",
    "",
    "  // scanlines (suaves)",
    "  float scanY=gl_FragCoord.y;",
    "  float medScan=sin((scanY+t*60.0*scanS)*0.15)*0.5+0.5;",
    "  float broadScan=smoothstep(0.3,0.7, sin((scanY+t*30.0*scanS)*0.03)*0.5+0.5);",
    "  float scan=mix(0.75,1.0,medScan)*mix(0.8,1.0,broadScan);",
    "  baseColor*=scan;",
    "",
    "  // línea brillante de barrido (tenue)",
    "  float brightScanPos=mod(t*40.0*scanS,u_res.y);",
    "  float brightScan=exp(-abs(scanY-brightScanPos)*0.14)*0.4;",
    "  baseColor+=vec3(0.25,0.7,1.0)*brightScan;",
    "",
    "  // shimmer holográfico",
    "  float shimmer=sin(centeredUV.x*18.0+centeredUV.y*13.0+t*1.8)*0.10+0.90;",
    "  baseColor*=shimmer;",
    "",
    "  // momentos de claridad",
    "  baseColor*= sin(t*0.4)*0.12+0.88;",
    "",
    "  // grano sutil",
    "  float grain=(hash2(gl_FragCoord.xy+fract(t*43.0)*1000.0)-0.5)*0.04;",
    "  baseColor+=grain;",
    "",
    "  // tone map suave",
    "  baseColor=baseColor/(baseColor+vec3(0.75));",
    "  baseColor=max(baseColor,vec3(0.0));",
    "",
    "  // ── Alpha: el efecto vive donde hay 'volumen'; el resto es transparente ──",
    "  // para que el color de fondo del sitio (--bg) se vea por debajo.",
    "  float lum=dot(baseColor,vec3(0.299,0.587,0.114));",
    "  float alpha=smoothstep(0.02,0.5,lum);",
    "  gl_FragColor=vec4(baseColor, alpha);",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(s));
    }
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    canvas.style.display = "none";
    return;
  }
  gl.useProgram(prog);

  // habilitar blending para el alpha
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(prog, "u_time");
  var uRes = gl.getUniformLocation(prog, "u_res");
  var uGlitchIntensity = gl.getUniformLocation(prog, "u_glitchIntensity");
  var uScanSpeed = gl.getUniformLocation(prog, "u_scanSpeed");

  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var needsResize = true;

  function resize() {
    needsResize = false;
    var scale = 1.0 / pixelScale;
    var w = Math.max(1, Math.round(window.innerWidth * dpr * scale));
    var h = Math.max(1, Math.round(window.innerHeight * dpr * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }
  }

  var running = !document.hidden;

  // Throttle a ~30fps — un fondo ambiente no necesita 60fps y ahorra batería/CPU
  var lastDraw = 0;
  var frameInterval = 1000 / 30;

  function render(now) {
    requestAnimationFrame(render);
    if (!running) return;
    if (now - lastDraw < frameInterval) return;
    lastDraw = now;
    if (needsResize) resize();
    gl.uniform1f(uTime, now * 0.001);
    gl.uniform1f(uGlitchIntensity, GLITCH_INTENSITY);
    gl.uniform1f(uScanSpeed, SCAN_SPEED);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  window.addEventListener("resize", function () { needsResize = true; });
  document.addEventListener("visibilitychange", function () { running = !document.hidden; });

  resize();
  requestAnimationFrame(render);
})();
