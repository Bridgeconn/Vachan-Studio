// src/router.tsx

import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      // We'll add more routes here later
      // { path: '/stt', element: <STTPage /> }
    ]
  }
]);