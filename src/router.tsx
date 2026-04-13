// src/router.tsx

import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { STTPage } from './pages/STTPage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/stt", // ← Make sure this route exists
        element: <STTPage />,
      },
      // We'll add more routes here later
      // { path: '/stt', element: <STTPage /> }
    ],
  },
]);
