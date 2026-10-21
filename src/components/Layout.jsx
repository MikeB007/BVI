import React from 'react';
import Navbar from './Navbar';
import ToastHost from './ToastHost';

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="container">{children}</main>
      <ToastHost />
    </div>
  );
}

