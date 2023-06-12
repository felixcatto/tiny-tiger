import React from 'react';
import { IApiErrors } from '../../lib/types.js';

export const Context = React.createContext(null as any);

export const RouterContext = React.createContext(null as any);

export const FormContext = React.createContext<IApiErrors>(null as any);
