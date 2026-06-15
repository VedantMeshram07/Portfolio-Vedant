import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';

// mock window for node
global.window = {
  innerWidth: 500, // force mobile
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {}
};

try {
  const html = renderToString(<App />);
  console.log("SUCCESS!");
} catch (e) {
  console.error("RENDER ERROR:", e.message);
}
