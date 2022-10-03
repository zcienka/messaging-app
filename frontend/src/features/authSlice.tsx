import {createSlice, PayloadAction} from "@reduxjs/toolkit"
import {RootState} from "../app/store"
import {TokenAuth} from "../utils/token"

const initialState: TokenAuth = {
    success: false,
    token: null,
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (
            state,
            action: PayloadAction<{ token: string, success: string }>
        ) => {
            localStorage.setItem(
                "user",
                JSON.stringify({
                    token: action.payload.token,
                })
            )
            state.token = action.payload.token
        },
        logout: (state) => {
            localStorage.clear()
            state.token = null
        },
        setCredentials: (
            state,
            {payload: {token}}: PayloadAction<{ token: string }>
        ) => {
            state.token = token
        },
    },
})

export const selectAuth = (state: RootState) => state.auth

export const {setUser, logout} = authSlice.actions

export default authSlice.reducer
