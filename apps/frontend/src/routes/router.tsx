import { createContext, useEffect, useState } from "react";
import { createBrowserRouter, createRoutesFromElements, redirect, Outlet, Routes, Route, Navigate } from "react-router-dom";
import { StartScreen } from './StartScreen';
import Session from './Session';

// // Examples
// const getUser = () => Promise.resolve({ name: 'John' });
// const logoutUser = () => Promise.resolve();

// interface IAuthContext {
//   user: IUser | null;
//   loading: boolean;
//   logout: () => void;
// }

// export const AuthContext = createContext({
//   user: null,
//   loading: true,
//   logout: () => {},
// } as IAuthContext);

// interface IUser {
//   name: string;
// }

// const AuthProvider = () => {
//   const [user, setUser] = useState<IUser | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getUser().then(user => {
//       setUser(user);
//       setLoading(false);
//     });
//   }, []);

//   const logout = () => {
//     setLoading(true);
//     logoutUser().then(() => {
//       setUser(null);
//       setLoading(false);
//     });
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, logout }}>
//       <Outlet />
//     </AuthContext.Provider>
//   );
// };

// TODO: The router could be dynamically generated, creating stage routes for each stage in the protocol?

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/session" element={<Session />} />
      <Route path="/session/:sessionId/:stageIndex" element={<Session />} />
      <Route path="/session/:sessionId" element={<Session />} />
      <Route path="/reset" element={<Navigate replace to="/start" />} />
      <Route path="/start" element={<StartScreen />} />
      <Route path="*" element={<Navigate replace to="/start" />} />
    </>
  )
)


export default router;
