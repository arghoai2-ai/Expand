import React from 'react';
import { AppProvider } from './context/AppContext.tsx';
import { AppShell } from './components/shell/AppShell.tsx';

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

