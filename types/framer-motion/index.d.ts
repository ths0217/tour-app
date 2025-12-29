// Minimal framer-motion shim to satisfy TypeScript when type packages are unavailable.
declare module 'framer-motion' {
  export const AnimatePresence: any;
  export const motion: any;
}
