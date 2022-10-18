import {createApi} from "@reduxjs/toolkit/query/react"
import baseQuery from "../utils/baseQuery"

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        loginUser: builder.mutation({
            query: (body) => {
                return {
                    url: "/login",
                    method: "POST",
                    body,
                }
            },
        }),
        registerUser: builder.mutation({
            query: (body: {
                username: string
                password: string
            }) => {
                return {
                    url: "/register",
                    method: "POST",
                    body,
                }
            },
        }),
    }),
})

export const {useLoginUserMutation, useRegisterUserMutation} = authApi
