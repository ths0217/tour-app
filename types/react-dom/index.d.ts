// Minimal ReactDOM client type shims for offline TypeScript tooling.
declare module 'react-dom' {
  export function createPortal(children: any, container: any): any;
}

declare module 'react-dom/client' {
  import type { ReactNode } from 'react';

  interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;
}
