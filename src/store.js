import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import thunk from 'redux-thunk';

import rootReducer from './reducers/rootReducer';


const persistConfig = {
  key: 'root',
  storage,
}

export default () => {
  let store = createStore(
    persistReducer(persistConfig, rootReducer),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
  );
  let persistor = persistStore(store);
  return { store, persistor }
}
