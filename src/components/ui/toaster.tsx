import { Toaster } from 'sonner';

export function Toast() {
  return (
    <Toaster 
      position="top-right"
      expand={false}
      richColors
      closeButton
      duration={4000}
    />
  );
}

// Re-export for backward compatibility
export { Toaster } from 'sonner';
