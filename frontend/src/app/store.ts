import {configureStore} from '@reduxjs/toolkit'
import {roomApi} from "../services/roomApi"
import {setupListeners} from "@reduxjs/toolkit/query"
import authReducer from "../features/authSlice"
import {userApi} from "../services/userApi"


const store = configureStore({
    reducer: {
        [roomApi.reducerPath]: roomApi.reducer,
        auth: authReducer,
        [userApi.reducerPath]: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(roomApi.middleware, userApi.middleware),
})

setupListeners(store.dispatch)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store