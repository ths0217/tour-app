// Minimal React type shims for offline TypeScript tooling.
declare namespace React {
  type ReactNode = any;
  type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
}

declare module 'react' {
  export type ReactNode = React.ReactNode;
  export type FC<P = {}> = React.FC<P>;
  export type Dispatch<A> = React.Dispatch<A>;
  export type SetStateAction<S> = React.SetStateAction<S>;

  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;

  export const Fragment: any;
  export const StrictMode: any;
  export function createElement(type: any, props: any, ...children: any[]): any;

  const React: {
    useState: typeof useState;
    useEffect: typeof useEffect;
    useMemo: typeof useMemo;
    useCallback: typeof useCallback;
    Fragment: typeof Fragment;
    StrictMode: typeof StrictMode;
    createElement: typeof createElement;
  };

  export default React;
}

declare module 'react/jsx-runtime' {
  export const Fragment: any;
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
