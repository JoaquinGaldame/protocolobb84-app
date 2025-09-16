import { Component, OnInit, OnDestroy, ElementRef, input, effect, viewChild, signal, ChangeDetectionStrategy } from '@angular/core';
import { Renderer, Program, Mesh, Color, Triangle, type OGLRenderingContext } from 'ogl';

// Interfaces para resolver los problemas de tipos
interface ProgramUniforms {
  [key: string]: {
    value: any;
  };
}

interface GeometryAttributes {
  [key: string]: any;
  uv?: {
    value: any;
  };
}

@Component({
  selector: 'app-aurora',
  standalone: true,
  template: `<div #container class="w-full h-full"></div>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuroraComponent implements OnInit, OnDestroy {
  // Inputs con signals
  colorStops = input<string[]>(['#5227FF', '#7cff67', '#5227FF']);
  amplitude = input<number>(1.0);
  blend = input<number>(0.5);
  time = input<number>(0);
  speed = input<number>(1.0);

  // Referencia al contenedor
  container = viewChild<ElementRef<HTMLDivElement>>('container');

  // Signals para el estado interno
  private renderer = signal<Renderer | null>(null);
  private program = signal<Program & { uniforms: ProgramUniforms } | null>(null);
  private animationId = signal<number | null>(null);
  private mesh = signal<Mesh | null>(null);

  // Shaders
  private VERT = `#version 300 es
    in vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  private FRAG = `#version 300 es
    precision highp float;

    uniform float uTime;
    uniform float uAmplitude;
    uniform vec3 uColorStops[3];
    uniform vec2 uResolution;
    uniform float uBlend;

    out vec4 fragColor;

    vec3 permute(vec3 x) {
      return mod(((x * 34.0) + 1.0) * x, 289.0);
    }

    float snoise(vec2 v){
      const vec4 C = vec4(
          0.211324865405187, 0.366025403784439,
          -0.577350269189626, 0.024390243902439
      );
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);

      vec3 p = permute(
          permute(i.y + vec3(0.0, i1.y, 1.0))
        + i.x + vec3(0.0, i1.x, 1.0)
      );

      vec3 m = max(
          0.5 - vec3(
              dot(x0, x0),
              dot(x12.xy, x12.xy),
              dot(x12.zw, x12.zw)
          ), 
          0.0
      );
      m = m * m;
      m = m * m;

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    struct ColorStop {
      vec3 color;
      float position;
    };

    #define COLOR_RAMP(colors, factor, finalColor) {              \
      int index = 0;                                            \
      for (int i = 0; i < 2; i++) {                               \
         ColorStop currentColor = colors[i];                    \
         bool isInBetween = currentColor.position <= factor;    \
         index = int(mix(float(index), float(i), float(isInBetween))); \
      }                                                         \
      ColorStop currentColor = colors[index];                   \
      ColorStop nextColor = colors[index + 1];                  \
      float range = nextColor.position - currentColor.position; \
      float lerpFactor = (factor - currentColor.position) / range; \
      finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / uResolution;
      
      ColorStop colors[3];
      colors[0] = ColorStop(uColorStops[0], 0.0);
      colors[1] = ColorStop(uColorStops[1], 0.5);
      colors[2] = ColorStop(uColorStops[2], 1.0);
      
      vec3 rampColor;
      COLOR_RAMP(colors, uv.x, rampColor);
      
      float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
      height = exp(height);
      height = (uv.y * 2.0 - height + 0.2);
      float intensity = 0.6 * height;
      
      float midPoint = 0.20;
      float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
      
      vec3 auroraColor = intensity * rampColor;
      
      fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
    }
  `;

  constructor() {
    // Efecto para responder a cambios en los inputs
    effect(() => {
      const program = this.program();
      if (!program) return;

      // Actualizar uniforms usando notación de corchetes
      program.uniforms['uAmplitude'].value = this.amplitude();
      program.uniforms['uBlend'].value = this.blend();
      
      const colorStopsArray = this.colorStops().map(hex => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });
      
      program.uniforms['uColorStops'].value = colorStopsArray;
    });

    // Efecto para manejar el redimensionamiento
    effect((onCleanup) => {
      const container = this.container()?.nativeElement;
      const renderer = this.renderer();
      
      if (!container || !renderer) return;
      
      const handleResize = () => this.resize();
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      onCleanup(() => {
        window.removeEventListener('resize', handleResize);
      });
    });
  }

  ngOnInit() {
    this.initWebGL();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private initWebGL() {
    const container = this.container()?.nativeElement;
    if (!container) return;

    try {
      // Crear renderer
      const renderer = new Renderer({
        alpha: true,
        premultipliedAlpha: true,
        antialias: true
      });
      
      const gl = renderer.gl as OGLRenderingContext;
      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      (gl.canvas as HTMLCanvasElement).style.backgroundColor = 'transparent';

      this.renderer.set(renderer);

      // Crear geometría
      const geometry = new Triangle(gl);
      
      // Eliminar atributo uv si existe (usando notación de corchetes)
      if (geometry.attributes['uv']) {
        delete geometry.attributes['uv'];
      }

      // Preparar color stops
      const colorStopsArray = this.colorStops().map(hex => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });

      // Crear programa con tipado adecuado
      const program = new Program(gl, {
        vertex: this.VERT,
        fragment: this.FRAG,
        uniforms: {
          uTime: { value: this.time() * this.speed() * 0.1 },
          uAmplitude: { value: this.amplitude() },
          uColorStops: { value: colorStopsArray },
          uResolution: { value: [container.offsetWidth, container.offsetHeight] },
          uBlend: { value: this.blend() }
        }
      }) as Program & { uniforms: ProgramUniforms };

      this.program.set(program);

      // Crear malla
      const mesh = new Mesh(gl, { geometry, program });
      this.mesh.set(mesh);
      
      // Añadir canvas al contenedor
      container.appendChild(gl.canvas as HTMLCanvasElement);
      
      // Configurar tamaño inicial
      this.resize();
      
      // Iniciar animación
      this.animate();

    } catch (error) {
      console.error('Error initializing WebGL:', error);
    }
  }

  private resize() {
    const container = this.container()?.nativeElement;
    const renderer = this.renderer();
    const program = this.program();
    
    if (!container || !renderer || !program) return;
    
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    
    renderer.setSize(width, height);
    program.uniforms['uResolution'].value = [width, height];
  }

  private animate = (timestamp?: number) => {
    const program = this.program();
    const renderer = this.renderer();
    const mesh = this.mesh();
    
    if (!program || !renderer || !mesh) return;
    
    // Actualizar tiempo usando notación de corchetes
    program.uniforms['uTime'].value = (timestamp || 0) * 0.001 * this.speed();
    
    // Renderizar
    renderer.render({ scene: mesh });
    
    // Continuar animación
    this.animationId.set(requestAnimationFrame(this.animate));
  }

  private cleanup() {
    // Cancelar animación
    const animationId = this.animationId();
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    
    // Limpiar WebGL
    const renderer = this.renderer();
    if (renderer) {
      const gl = renderer.gl;
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
      
      // Remover canvas
      const canvas = gl.canvas as HTMLCanvasElement;
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }
}