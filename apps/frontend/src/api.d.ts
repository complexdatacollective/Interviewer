export interface INetworkCanvasAPI {
  readonly query: (query: string) => Promise<any>;
}

declare global {
  interface Window {
    readonly api: INetworkCanvasAPI;
  }
}