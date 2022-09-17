import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit'
import axios from 'axios'
import React from 'react'
import jwtDecode from 'jwt-decode'
import apiRequest from "../utils/apiRequest";
import {TokenAuth} from "../utils/token";
import {PersistProfile} from "../utils/reduxPersist";

const initialState = {
    refresh: null,
    access: null,
    loading: 'idle',
} as TokenAuth;

export interface JWTToken {
    exp: number,
    iat: number,
    jti: string,
    token_type: string,
    user_id: number,
    username: string,
}

export const authenticateUser = createAsyncThunk(
    'authenticate/authenticateUser',
    async (userLoginRequest: UserLoginRequest) => {
        const {data} = await apiRequest.post('user/token/', userLoginRequest)
        return data
    }
)

export const refreshToken = createAsyncThunk(
    'authenticate/refreshToken',
    async () => {
        const profile: PersistProfile = JSON.parse(localStorage.getItem('persist:profile') || '{}')
        const token: TokenAuth = JSON.parse(profile.auth)
        const {data} = await axios.post('user/token/refresh/', {refresh: token.refresh})
        return data
    }
)

export const blacklistToken = createAsyncThunk(
    'authenticate/blacklistToken',
    async () => {
        const profile: PersistProfile = JSON.parse(localStorage.getItem('persist:profile') || '{}')
        const token: TokenAuth = JSON.parse(profile.auth)
        const {data} = await axios.post('user/token/blacklist/', {refresh: token.refresh})
        return data
    }
)

export const authSlice = createSlice({
    name: 'authenticate',
    initialState,
    extraReducers: builder => {
        builder.addCase(authenticateUser.pending, (state) => {
            return {
                ...state,
                loading: 'pending'
            }
        })
        builder.addCase(authenticateUser.fulfilled, (state, action) => {
                return {
                    ...state,
                    access: action.payload.access,
                    refresh: action.payload.refresh,
                    loading: 'succeeded'
                }
            }
        )
        builder.addCase(authenticateUser.rejected, (state) => {
            return {
                ...state,
                loading: 'failed'
            }
        })

        builder.addCase(refreshToken.pending, (state) => {
            return {
                ...state,
                loading: 'pending'
            }
        })
        builder.addCase(refreshToken.fulfilled, (state, action) => {
                return {
                    ...state,
                    access: action.payload.access,
                    refresh: action.payload.refresh,
                    loading: 'succeeded'
                }
            }
        )
        builder.addCase(refreshToken.rejected, (state) => {
            return {...state, access: null, refresh: null, loading: 'failed'}
        })

        builder.addCase(blacklistToken.pending, (state) => {
            return {
                ...state,
                loading: 'pending'
            }
        })
        builder.addCase(blacklistToken.fulfilled, (state, action) => {
                return {
                    ...state,
                    access: null, refresh: null,
                    loading: 'succeeded'
                }
            }
        )
        builder.addCase(blacklistToken.rejected, (state) => {
            return {
                ...state,
                access: null, refresh: null,
                loading: 'succeeded'
            }
        })
    },
    reducers: {}
})

export default authSlice.reducer
