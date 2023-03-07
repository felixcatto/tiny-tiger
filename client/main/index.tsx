import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '../css/index.css';
import { routes } from '../lib/utils.jsx';
import Login from '../session/Login.jsx';
import TodoList from '../todoList/Todolist.jsx';
import App from './app';

const router = createBrowserRouter([
  {
    path: routes.home,
    element: <App Component={TodoList} />,
  },
  {
    path: routes.newSession,
    element: <App Component={Login} />,
  },
]);

const root = createRoot(document.getElementById('root')!);
root.render(<RouterProvider router={router} />);
