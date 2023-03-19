import '../css/index.css'; // Import FIRST
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './app';
import '../css/tailwind.css'; // Import LAST

const initialState = (window as any).INITIAL_STATE;

hydrateRoot(document.getElementById('root')!, <App initialState={initialState} />);
