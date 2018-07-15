import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'

import App from './components/App';
import configureStore from './store';
import registerServiceWorker from './registerServiceWorker';
import './index.css';


const { persistor, store } = configureStore()

const app = (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();

/*
1) Rehydrate store
2) Refactor PlanPage
*/