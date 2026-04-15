// src/App.tsx

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <TooltipProvider delayDuration={0}>
      <RouterProvider router={router} />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;