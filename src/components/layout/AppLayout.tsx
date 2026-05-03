import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 px-4 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
