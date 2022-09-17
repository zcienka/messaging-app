import { combineReducers } from 'redux'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import authReducer from "../features/authSlice"
// import registerReducer from "../features/registerSlice"

export const rootReducer = combineReducers({
    auth: authReducer,
    // register: registerReducer,
});

const configStorage = {
    key: 'profile',
    storage,
    whitelist: ['auth']
};

export default persistReducer(configStorage, rootReducer)
