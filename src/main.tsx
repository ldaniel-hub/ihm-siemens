import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@ffe-senai/smart40/dev-tools';

declare module 'react' {
  // React's automatic JSX runtime exposes custom element types through React.JSX.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'smart40-devtools': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
    
    {import.meta.env.DEV && (
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
        <smart40-devtools></smart40-devtools>
      </div>
    )}
  </React.StrictMode>
);