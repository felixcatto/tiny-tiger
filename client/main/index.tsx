import '../../public/cssSource/index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import TodoList from '../todoList/Todolist.js';

const root = createRoot(document.getElementById('root')!);
root.render(<App Component={TodoList} />);
