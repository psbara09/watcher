import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import App from './App';
import './index.css';

window.addEventListener('error', (event) => {
  document.getElementById('root')!.innerHTML = `<pre style="color:red;padding:20px;">Runtime Error:\n${event.message}\n${event.filename}:${event.lineno}</pre>`;
});

window.addEventListener('unhandledrejection', (event) => {
  document.getElementById('root')!.innerHTML = `<pre style="color:red;padding:20px;">Unhandled Promise Rejection:\n${event.reason}</pre>`;
});

const root = document.getElementById('root');

if (root) {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>
    );
  } catch (e) {
    root.innerHTML = `<pre style="color:red;padding:20px;">Render Error: ${e}</pre>`;
  }
} else {
  document.body.innerHTML = '<h1 style="color:red;padding:20px;">Error: Root element not found</h1>';
}
