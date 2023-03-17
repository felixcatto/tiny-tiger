import '../css/index.css'; // Import FIRST
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import '../css/tailwind.css'; // Import LAST

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
