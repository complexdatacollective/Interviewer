export type AppAPI = {
  getAppVersion: () => Promise<string>;
  getApiSource: () => string;
};

export type UserAPI = {
  addUser: (user: User) => Promise<User>;
  getUsers: () => Promise<User[]>;
  getUser: (id: string) => Promise<User>;
  updateUser: (user: User) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
};

export type ProtocolAPI = {
  addProtocol: (protocol: Protocol) => Promise<Protocol>;
  getProtocols: () => Promise<Protocol[]>;
  getProtocol: (id: string) => Promise<Protocol>;
  updateProtocol: (protocol: Protocol) => Promise<Protocol>;
  deleteProtocol: (id: string) => Promise<void>;
};

export interface INetworkCanvasAPI {
  protocols: protocolsAPI;
  users: UserAPI;
}

declare global {
  interface Window {
    api: INetworkCanvasAPI;
  }
}