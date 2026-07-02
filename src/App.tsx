// src/App.tsx

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useJobStore } from '@/store/jobStore';

function App() {
  const loadJobsFromDB = useJobStore((state) => state.loadJobsFromDB);

  // Load jobs from IndexedDB on app start
  useEffect(() => {
    loadJobsFromDB();
  }, [loadJobsFromDB]);

  return (
    <TooltipProvider delayDuration={0}>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </TooltipProvider>
  );
}

export default App;