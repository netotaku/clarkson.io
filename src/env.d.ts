/// <reference types="astro/client" />

declare module '*.astro' {
  const component: import('astro/runtime/server/index.js').AstroComponentFactory;
  export default component;
}

declare module '@tabler/icons-astro/dist/esm/icons/chevron-left.mjs' {
  const component: import('astro/runtime/server/index.js').AstroComponentFactory;
  export default component;
}

declare module '@tabler/icons-astro/dist/esm/icons/chevron-right.mjs' {
  const component: import('astro/runtime/server/index.js').AstroComponentFactory;
  export default component;
}
