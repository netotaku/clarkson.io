import type { PhysicsConfig } from '../pixel/types';

const SVG_NS = 'http://www.w3.org/2000/svg';

type SampleMode =
  | 'average'
  | 'top'
  | 'bottom'
  | 'centre';

type Colour = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type Cell = {
  col: number;
  row: number;
  attached: boolean;
  detached: boolean;
  support: number;
  colour: Colour;
};

const clamp = (
  value: number,
  min = 0,
  max = 1,
) =>
  Math.max(
    min,
    Math.min(
      max,
      value,
    ),
  );

const numberValue = (
  value: string | undefined,
  fallback: number,
) => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const booleanValue = (
  value: string | undefined,
  fallback: boolean,
) =>
  value === undefined
    ? fallback
    : value !== 'false';

class PixelHero {
  private root: HTMLElement;
  private image: HTMLImageElement;
  private svg: SVGSVGElement;
  private parallaxLayer: HTMLElement;

  private topHeight: number;
  private pitch: number;
  private dotScale: number;
  private cornerRadius: number;

  private saturation: number;
  private contrast: number;

  private backgroundTarget: string;
  private backgroundSample: SampleMode;
  private backgroundMix: number;

  private parallax: boolean;
  private parallaxSpeed: number;

  private physics: PhysicsConfig;

  private columns = 1;
  private rows = 1;
  private tailRows = 1;

  private pixels: Uint8ClampedArray | null = null;
  private cells: Cell[] = [];

  private resizeObserver?: ResizeObserver;
  private resizeTimer = 0;
  private scrollFrame = 0;

  constructor(
    root: HTMLElement,
  ) {
    this.root = root;

    this.image =
      root.querySelector<HTMLImageElement>(
        '.pixel-hero__source',
      )!;

    this.svg =
      root.querySelector<SVGSVGElement>(
        '[data-pixel-svg]',
      )!;

    this.parallaxLayer =
      root.querySelector<HTMLElement>(
        '[data-parallax-layer]',
      )!;

    const d = root.dataset;

    this.topHeight =
      numberValue(
        d.topHeight,
        600,
      );

    this.pitch =
      numberValue(
        d.pixelPitch,
        18,
      );

    this.dotScale =
      numberValue(
        d.dotScale,
        0.44,
      );

    this.cornerRadius =
      numberValue(
        d.cornerRadius,
        24,
      );

    this.saturation =
      numberValue(
        d.saturation,
        1,
      );

    this.contrast =
      numberValue(
        d.contrast,
        1,
      );

    this.backgroundTarget =
      d.backgroundTarget ??
      'body';

    this.backgroundSample =
      (
        d.backgroundSample as
          SampleMode | undefined
      ) ?? 'average';

    this.backgroundMix =
      numberValue(
        d.backgroundMix,
        0.29,
      );

    this.parallax =
      booleanValue(
        d.parallax,
        true,
      );

    this.parallaxSpeed =
      numberValue(
        d.parallaxSpeed,
        0.08,
      );

    this.physics =
      JSON.parse(
        d.physics ?? '{}',
      ) as PhysicsConfig;

    this.render =
      this.render.bind(this);

    this.onScroll =
      this.onScroll.bind(this);

    this.init();
  }

  private init() {
    this.resizeObserver =
      new ResizeObserver(() => {
        window.clearTimeout(
          this.resizeTimer,
        );

        this.resizeTimer =
          window.setTimeout(
            this.render,
            120,
          );
      });

    this.resizeObserver.observe(
      this.root,
    );

    window.addEventListener(
      'scroll',
      this.onScroll,
      { passive: true },
    );

    if (
      this.image.complete &&
      this.image.naturalWidth > 0
    ) {
      this.render();
    } else {
      this.image.addEventListener(
        'load',
        this.render,
        { once: true },
      );
    }

    this.applyParallax();
  }

  private render() {
    const width =
      this.root.clientWidth;

    if (
      !width ||
      !this.image.complete ||
      this.image.naturalWidth <= 0
    ) {
      return;
    }

    this.columns =
      Math.max(
        1,
        Math.ceil(
          width /
          this.pitch,
        ),
      );

    this.rows =
      Math.max(
        1,
        Math.ceil(
          this.topHeight /
          this.pitch,
        ),
      );

    this.tailRows =
      Math.max(
        1,
        Math.ceil(
          this.physics.fragmentDistance /
          this.pitch,
        ),
      );

    const topPixelHeight =
      this.rows *
      this.pitch;

    const totalHeight =
      topPixelHeight +
      this.tailRows *
      this.pitch;

    this.root.style.setProperty(
      '--pixel-hero-height',
      `${totalHeight}px`,
    );

    this.svg.setAttribute(
      'viewBox',
      `0 0 ` +
      `${this.columns * this.pitch} ` +
      `${totalHeight}`,
    );

    const canvas =
      document.createElement(
        'canvas',
      );

    canvas.width =
      this.columns;

    canvas.height =
      this.rows;

    const context =
      canvas.getContext(
        '2d',
        {
          willReadFrequently: true,
        },
      );

    if (!context) {
      return;
    }

    this.drawCover(
      context,
      this.image,
      this.columns,
      this.rows,
    );

    try {
      this.pixels =
        context.getImageData(
          0,
          0,
          this.columns,
          this.rows,
        ).data;
    } catch (error) {
      console.error(
        'PixelHero could not read image pixels. Check CORS.',
        error,
      );

      return;
    }

    this.buildCells();
    this.erodeField();
    this.renderPhysicsField();

    this.applyBackground();
    this.applyParallax();

    this.root.classList.add(
      'is-ready',
    );
  }

  private buildCells() {
    this.cells = [];

    for (
      let row = 0;
      row < this.rows;
      row++
    ) {
      for (
        let col = 0;
        col < this.columns;
        col++
      ) {
        this.cells.push({
          col,
          row,
          attached: true,
          detached: false,
          support: 1,
          colour:
            this.sampleColour(
              col,
              row,
            ),
        });
      }
    }
  }

  private erodeField() {
    const startRow =
      Math.floor(
        clamp(
          this.physics.dissolveStart,
        ) *
        (this.rows - 1),
      );

    /*
      Multiple passes let local gaps weaken neighbouring cells.
      This is the core of the "crumbling material" behaviour.
    */
    const passes = 4;

    for (
      let pass = 0;
      pass < passes;
      pass++
    ) {
      const detach: number[] = [];

      for (
        let row = startRow;
        row < this.rows;
        row++
      ) {
        const depth =
          this.rows <= startRow + 1
            ? 1
            : (
                row -
                startRow
              ) /
              (
                this.rows -
                1 -
                startRow
              );

        for (
          let col = 0;
          col < this.columns;
          col++
        ) {
          const index =
            this.index(
              col,
              row,
            );

          const cell =
            this.cells[index];

          if (
            !cell.attached
          ) {
            continue;
          }

          const neighbourSupport =
            this.getNeighbourSupport(
              col,
              row,
            );

          const noise =
            this.hash(
              col +
              pass * 997,
              row +
              3000,
            );

          /*
            Cells lower down are naturally weaker.
            Cells with neighbours survive more readily.
          */
          /*
            Convert erosion into a probability rather than asking it to
            numerically "beat" structural strength.

            The previous version could barely detach anything with sane
            settings because structuralStrength was commonly ~0.7–1 while
            erosionForce topped out around the configured erosion value.
          */
          const depthForce =
            Math.pow(
              depth,
              1.35,
            ) *
            this.physics.erosion;

          /*
            High neighbour support + high cohesion reduce the chance of
            breaking away, but never make a cell indestructible.
          */
          const supportResistance =
            neighbourSupport *
            this.physics.cohesion;

          const supportModifier =
            1 -
            supportResistance *
            0.72;

          /*
            Noise gives irregular cracks rather than a horizontal cutoff.
            Later erosion passes naturally weaken areas next to holes.
          */
          const breakProbability =
            clamp(
              depthForce *
              supportModifier *
              (
                0.55 +
                noise *
                0.9
              ),
              0,
              0.96,
            );

          cell.support =
            1 -
            breakProbability;

          const breakRoll =
            this.hash(
              col +
              pass * 1709,
              row +
              9101,
            );

          if (
            breakRoll <
            breakProbability
          ) {
            detach.push(index);
          }
        }
      }

      for (
        const index
        of detach
      ) {
        this.cells[index]
          .attached = false;

        this.cells[index]
          .detached = true;
      }
    }
  }

  private getNeighbourSupport(
    col: number,
    row: number,
  ) {
    const offsets = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];

    let attached = 0;
    let total = 0;

    for (
      const [dx, dy]
      of offsets
    ) {
      const x =
        col + dx;

      const y =
        row + dy;

      if (
        x < 0 ||
        y < 0 ||
        x >= this.columns ||
        y >= this.rows
      ) {
        continue;
      }

      total++;

      if (
        this.cells[
          this.index(
            x,
            y,
          )
        ]?.attached
      ) {
        attached++;
      }
    }

    if (!total) {
      return 0;
    }

    return (
      attached /
      total
    );
  }

  private renderPhysicsField() {
    const fragment =
      document.createDocumentFragment();

    const size =
      this.pitch *
      this.dotScale;

    const radius =
      size *
      (
        this.cornerRadius /
        100
      );

    /*
      Render attached hero cells.
    */
    for (
      const cell
      of this.cells
    ) {
      if (
        !cell.attached
      ) {
        continue;
      }

      this.appendRect(
        fragment,
        cell.col,
        cell.row,
        cell.colour,
        1,
        size,
        radius,
      );
    }

    /*
      Render detached cells as static grid-snapped fragments.
    */
    const occupied =
      new Set<string>();

    for (
      const cell
      of this.cells
    ) {
      if (
        !cell.detached
      ) {
        continue;
      }

      const destination =
        this.calculateFragmentDestination(
          cell,
        );

      const key =
        `${destination.col}:${destination.row}`;

      if (
        occupied.has(key)
      ) {
        continue;
      }

      occupied.add(key);

      const distanceRows =
        Math.max(
          0,
          destination.row -
          cell.row,
        );

      const distanceProgress =
        clamp(
          distanceRows /
          Math.max(
            1,
            this.tailRows,
          ),
        );

      const opacity =
        this.physics.tailOpacity *
        Math.pow(
          1 -
          distanceProgress,
          this.physics.tailFadeCurve,
        );

      this.appendRect(
        fragment,
        destination.col,
        destination.row,
        cell.colour,
        opacity,
        size,
        radius,
      );
    }

    this.svg.replaceChildren(
      fragment,
    );

    this.svg.style.filter =
      `saturate(${this.saturation}) ` +
      `contrast(${this.contrast})`;
  }

  private calculateFragmentDestination(
    cell: Cell,
  ) {
    /*
      We calculate a fake trajectory once, then snap the result to the grid.

      Nearby pixels share similar column-level drift, which gives loose
      chunks/strands instead of unrelated confetti.
    */
    const familyDrift =
      (
        this.hash(
          cell.col,
          6001,
        ) -
        0.5
      ) *
      this.physics.turbulence *
      10;

    const localDrift =
      (
        this.hash(
          cell.col,
          cell.row +
          7001,
        ) -
        0.5
      ) *
      this.physics.turbulence *
      4;

    const release =
      this.hash(
        cell.col,
        cell.row +
        8001,
      );

    /*
      Longer falls are less common, but gravity biases some fragments
      substantially downward.
    */
    const travel =
      Math.pow(
        release,
        1 /
        Math.max(
          0.05,
          this.physics.gravity,
        ),
      );

    const fallRows =
      Math.max(
        1,
        Math.round(
          travel *
          this.tailRows,
        ),
      );

    const dragFactor =
      1 /
      (
        1 +
        this.physics.drag *
        fallRows
      );

    const horizontalRows =
      (
        familyDrift +
        localDrift
      ) *
      dragFactor *
      Math.sqrt(
        fallRows,
      );

    const targetCol =
      Math.max(
        0,
        Math.min(
          this.columns - 1,
          Math.round(
            cell.col +
            horizontalRows,
          ),
        ),
      );

    const targetRow =
      Math.min(
        this.rows +
        this.tailRows -
        1,
        cell.row +
        fallRows,
      );

    return {
      col: targetCol,
      row: targetRow,
    };
  }

  private appendRect(
    fragment: DocumentFragment,
    col: number,
    row: number,
    colour: Colour,
    opacity: number,
    size: number,
    radius: number,
  ) {
    const rect =
      document.createElementNS(
        SVG_NS,
        'rect',
      );

    rect.setAttribute(
      'x',
      String(
        col *
        this.pitch +
        (
          this.pitch -
          size
        ) / 2,
      ),
    );

    rect.setAttribute(
      'y',
      String(
        row *
        this.pitch +
        (
          this.pitch -
          size
        ) / 2,
      ),
    );

    rect.setAttribute(
      'width',
      String(size),
    );

    rect.setAttribute(
      'height',
      String(size),
    );

    rect.setAttribute(
      'rx',
      String(radius),
    );

    rect.setAttribute(
      'ry',
      String(radius),
    );

    rect.setAttribute(
      'fill',
      `rgb(` +
      `${colour.r} ` +
      `${colour.g} ` +
      `${colour.b}` +
      `)`,
    );

    rect.setAttribute(
      'fill-opacity',
      String(
        clamp(
          colour.a *
          opacity,
        ),
      ),
    );

    fragment.append(rect);
  }

  private index(
    col: number,
    row: number,
  ) {
    return (
      row *
      this.columns +
      col
    );
  }

  private sampleColour(
    col: number,
    row: number,
  ): Colour {
    if (
      !this.pixels
    ) {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0,
      };
    }

    const x =
      Math.max(
        0,
        Math.min(
          this.columns - 1,
          col,
        ),
      );

    const y =
      Math.max(
        0,
        Math.min(
          this.rows - 1,
          row,
        ),
      );

    const i =
      (
        y *
        this.columns +
        x
      ) * 4;

    return {
      r:
        this.pixels[i],

      g:
        this.pixels[
          i + 1
        ],

      b:
        this.pixels[
          i + 2
        ],

      a:
        this.pixels[
          i + 3
        ] / 255,
    };
  }

  private drawCover(
    context:
      CanvasRenderingContext2D,
    image:
      HTMLImageElement,
    targetWidth:
      number,
    targetHeight:
      number,
  ) {
    const sourceWidth =
      image.naturalWidth;

    const sourceHeight =
      image.naturalHeight;

    const sourceRatio =
      sourceWidth /
      sourceHeight;

    const targetRatio =
      targetWidth /
      targetHeight;

    let sx = 0;
    let sy = 0;
    let sw =
      sourceWidth;
    let sh =
      sourceHeight;

    if (
      sourceRatio >
      targetRatio
    ) {
      sw =
        sourceHeight *
        targetRatio;

      sx =
        (
          sourceWidth -
          sw
        ) / 2;
    } else {
      sh =
        sourceWidth /
        targetRatio;

      sy =
        (
          sourceHeight -
          sh
        ) / 2;
    }

    context.clearRect(
      0,
      0,
      targetWidth,
      targetHeight,
    );

    context.drawImage(
      image,
      sx,
      sy,
      sw,
      sh,
      0,
      0,
      targetWidth,
      targetHeight,
    );
  }

  private applyBackground() {
    if (
      !this.pixels ||
      this.backgroundTarget ===
        'none'
    ) {
      return;
    }

    const colour =
      this.sampleBackgroundColour();

    const mix =
      clamp(
        this.backgroundMix,
      );

    const cssColour =
      `rgb(` +
      `${Math.round(colour.r * mix)} ` +
      `${Math.round(colour.g * mix)} ` +
      `${Math.round(colour.b * mix)}` +
      `)`;

    const target =
      this.backgroundTarget ===
      'self'
        ? this.root
        : document.querySelector<HTMLElement>(
            this.backgroundTarget,
          );

    if (target) {
      target.style.backgroundColor =
        cssColour;
    }

    document.documentElement
      .style
      .setProperty(
        '--pixel-hero-background',
        cssColour,
      );
  }

  private sampleBackgroundColour() {
    const coords:
      Array<
        [number, number]
      > = [];

    if (
      this.backgroundSample ===
      'top'
    ) {
      for (
        let x = 0;
        x < this.columns;
        x++
      ) {
        coords.push(
          [x, 0],
        );
      }
    } else if (
      this.backgroundSample ===
      'bottom'
    ) {
      for (
        let x = 0;
        x < this.columns;
        x++
      ) {
        coords.push(
          [
            x,
            this.rows - 1,
          ],
        );
      }
    } else if (
      this.backgroundSample ===
      'centre'
    ) {
      const cx =
        Math.floor(
          this.columns / 2,
        );

      const cy =
        Math.floor(
          this.rows / 2,
        );

      for (
        let y =
          Math.max(
            0,
            cy - 1,
          );
        y <=
          Math.min(
            this.rows - 1,
            cy + 1,
          );
        y++
      ) {
        for (
          let x =
            Math.max(
              0,
              cx - 1,
            );
          x <=
            Math.min(
              this.columns - 1,
              cx + 1,
            );
          x++
        ) {
          coords.push(
            [x, y],
          );
        }
      }
    } else {
      for (
        let y = 0;
        y < this.rows;
        y++
      ) {
        for (
          let x = 0;
          x < this.columns;
          x++
        ) {
          coords.push(
            [x, y],
          );
        }
      }
    }

    let r = 0;
    let g = 0;
    let b = 0;
    let weight = 0;

    for (
      const [x, y]
      of coords
    ) {
      const c =
        this.sampleColour(
          x,
          y,
        );

      if (
        c.a <= 0
      ) {
        continue;
      }

      r +=
        c.r *
        c.a;

      g +=
        c.g *
        c.a;

      b +=
        c.b *
        c.a;

      weight +=
        c.a;
    }

    if (
      weight <= 0
    ) {
      return {
        r: 0,
        g: 0,
        b: 0,
      };
    }

    return {
      r:
        r /
        weight,

      g:
        g /
        weight,

      b:
        b /
        weight,
    };
  }

  private onScroll() {
    if (
      this.scrollFrame
    ) {
      return;
    }

    this.scrollFrame =
      requestAnimationFrame(
        () => {
          this.scrollFrame = 0;
          this.applyParallax();
        },
      );
  }

  private applyParallax() {
    const reduced =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

    const y =
      !this.parallax ||
      reduced
        ? 0
        : window.scrollY *
          this.parallaxSpeed;

    this.parallaxLayer
      .style
      .transform =
      `translate3d(0, ${y}px, 0)`;
  }

  private hash(
    a: number,
    b: number,
  ) {
    let value =
      Math.imul(
        (
          this.physics.seed +
          1
        ) ^ a,
        0x45d9f3b,
      ) ^
      Math.imul(
        b + 1,
        0x27d4eb2d,
      );

    value ^=
      value >>> 16;

    value =
      Math.imul(
        value,
        0x7feb352d,
      );

    value ^=
      value >>> 15;

    value =
      Math.imul(
        value,
        0x846ca68b,
      );

    value ^=
      value >>> 16;

    return (
      (
        value >>>
        0
      ) /
      4294967296
    );
  }

  public destroy() {
    this.resizeObserver
      ?.disconnect();

    window.removeEventListener(
      'scroll',
      this.onScroll,
    );

    if (
      this.scrollFrame
    ) {
      cancelAnimationFrame(
        this.scrollFrame,
      );
    }
  }
}

const instances =
  new WeakMap<
    HTMLElement,
    PixelHero
  >();

function initialise() {
  document
    .querySelectorAll<HTMLElement>(
      '[data-pixel-hero]',
    )
    .forEach(
      root => {
        if (
          !instances.has(
            root,
          )
        ) {
          instances.set(
            root,
            new PixelHero(
              root,
            ),
          );
        }
      },
    );
}

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initialise,
    { once: true },
  );
} else {
  initialise();
}

document.addEventListener(
  'astro:page-load',
  initialise,
);
