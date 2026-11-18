/* ==========================================================================
   CIEL — fond WebGL de la page d'accueil (aucune dépendance)
   Un seul quad plein écran, un fragment shader : dégradé de ciel + nuages fBm.
   État piloté de l'extérieur par DJP.sky = { climb, density, dusk } (tweens ScrollTrigger dans home.js).
   Temps : celui du ticker GSAP (une seule horloge). Pause hors onglet. Mouvement réduit : une image, redessinée
   seulement quand l'état change. Sans WebGL : le dégradé CSS de body.has-sky reste en place.
   ========================================================================== */
(function () {
  'use strict';
  var cv = document.getElementById('sky');
  if (!cv) return;
  var gl = cv.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: 'low-power' });
  if (!gl) { cv.remove(); return; }

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DJP = window.DJP = window.DJP || {};
  // Le ciel commence à l'heure réelle du visiteur (html[data-hour], posé dans <head> ; ?hour=21 pour tester) :
  // aube, jour, fin de journée, soir, nuit étoilée. Le défilement mène toujours au crépuscule ambre du rendez-vous.
  var hour = parseInt(document.documentElement.getAttribute('data-hour'), 10);
  if (isNaN(hour)) hour = new Date().getHours();
  var base = hour >= 20 || hour < 5 ? { dusk: 0.3, night: 1 }
    : hour < 7 ? { dusk: 0.6, night: 0.15 }
    : hour < 17 ? { dusk: 0, night: 0 }
    : hour < 19 ? { dusk: 0.45, night: 0 }
    : { dusk: 0.75, night: 0.2 };
  var state = DJP.sky = DJP.sky || { climb: 0, density: 0.42, dusk: base.dusk, night: base.night };
  if (state.night === undefined) { state.dusk = base.dusk; state.night = base.night; }
  DJP.skyBase = base;

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FRAG = [
    'precision mediump float;',
    'uniform vec2 uRes;uniform float uTime;uniform float uClimb;uniform float uDensity;uniform float uDusk;uniform float uNight;uniform vec2 uMouse;',
    'float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=r*p*2.02;a*=.5;}return v;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;',
    ' vec2 q=vec2(uv.x*asp,uv.y);',
    // Ciel de jour : bleu en haut, blanc nuageux à l'horizon. Crépuscule : bleu-gris en haut, ambre rouge en bas.
    ' vec3 dayTop=vec3(.40,.68,.86),dayLow=vec3(.86,.93,.97);',
    ' vec3 duskTop=vec3(.36,.45,.62),duskLow=vec3(.93,.58,.42);',
    ' float g=smoothstep(0.,1.,uv.y);',
    ' vec3 sky=mix(mix(dayLow,dayTop,g),mix(duskLow,duskTop,pow(g,.8)),uDusk);',
    // Nuages : domaine déformé, défilent lentement à l'horizontale ; la montée les fait descendre (on traverse la couche)
    ' vec2 c=q*1.35+vec2(uTime*.012,-uClimb*1.6)+uMouse*.035;',
    ' vec2 w=vec2(fbm(c+vec2(0.,uTime*.006)),fbm(c+vec2(5.2,1.3)));',
    ' float d=fbm(c*1.1+w*1.4);',
    ' float cover=smoothstep(1.-uDensity,1.-uDensity+.32,d);',
    // Volume : la face basse des nuages est un peu plus sombre (ombre), la crête plus claire
    ' float shade=fbm(c*1.1+w*1.4+vec2(0.,.06));',
    ' vec3 cloudDay=mix(vec3(.80,.86,.92),vec3(1.),smoothstep(.35,.75,d-shade+.55));',
    ' vec3 cloudDusk=mix(vec3(.78,.55,.50),vec3(1.,.86,.74),smoothstep(.35,.75,d-shade+.55));',
    ' vec3 cloud=mix(cloudDay,cloudDusk,uDusk);',
    ' vec3 col=mix(sky,cloud,cover*.92);',
    // Nuit : bleu encre, nuages gris-bleu, étoiles fixes (aucune scintillation) masquées par les nuages
    ' vec3 nSky=mix(vec3(.10,.17,.27),vec3(.04,.08,.15),g);',
    ' vec3 nCloud=mix(vec3(.15,.22,.32),vec3(.30,.38,.50),smoothstep(.35,.75,d-shade+.55));',
    ' vec2 sc=floor(gl_FragCoord.xy/2.);float st=step(.9965,h(sc*.731));',
    ' float star=st*smoothstep(.25,.75,uv.y)*(1.-cover)*(.55+.45*h(sc+3.1));',
    ' vec3 nCol=mix(nSky,nCloud,cover*.85)+vec3(star*.9);',
    ' col=mix(col,nCol,uNight);',
    ' col+=(h(gl_FragCoord.xy+uTime)-.5)*.012;', // tramage léger contre les bandes
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) { cv.remove(); return; }
  var prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { cv.remove(); return; }
  gl.useProgram(prog);
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {};
  ['uRes', 'uTime', 'uClimb', 'uDensity', 'uDusk', 'uNight', 'uMouse'].forEach(function (k) { U[k] = gl.getUniformLocation(prog, k); });

  // Rendu à résolution réduite : un ciel flou par nature, autant économiser le GPU
  var SCALE = 0.5;
  function size() {
    var w = Math.max(1, Math.round(innerWidth * SCALE)), h = Math.max(1, Math.round(innerHeight * SCALE));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
  }

  var mouse = { x: 0, y: 0 }, mTarget = { x: 0, y: 0 };
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) {
      mTarget.x = e.clientX / innerWidth - 0.5; mTarget.y = 0.5 - e.clientY / innerHeight;
    }, { passive: true });
  }

  var last = '';
  function draw(t) {
    size();
    mouse.x += (mTarget.x - mouse.x) * 0.03; mouse.y += (mTarget.y - mouse.y) * 0.03;
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uClimb, state.climb);
    gl.uniform1f(U.uDensity, state.density);
    gl.uniform1f(U.uDusk, state.dusk);
    gl.uniform1f(U.uNight, state.night || 0);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  document.documentElement.classList.add('sky-on');
  if (reduce || !window.gsap) {
    // Image fixe ; on ne redessine que si l'état du défilement a changé
    draw(40);
    var check = function () {
      var k = state.climb.toFixed(3) + state.density.toFixed(3) + state.dusk.toFixed(3) + (state.night || 0).toFixed(3);
      if (k !== last) { last = k; draw(40); }
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
    window.addEventListener('resize', function () { draw(40); });
    return;
  }
  var hidden = false;
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; });
  gsap.ticker.add(function (time) { if (!hidden) draw(time + 40); });
})();
