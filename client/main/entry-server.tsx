import { renderToString } from 'react-dom/server';
import { App } from '../common/App.jsx';

export const render = initialState => renderToString(<App {...initialState} />);
