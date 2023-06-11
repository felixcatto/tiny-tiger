import React from 'react';
import { IApiErrors } from '../../lib/types.js';

export const Context: any = React.createContext(null);

export const FormContext = React.createContext<IApiErrors>(null as any);
