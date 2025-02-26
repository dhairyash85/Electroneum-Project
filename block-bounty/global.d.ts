// global.d.ts (if you don't already have one)
export {};

declare global {
  interface Window {
    ethereum?: any;
  }
}
