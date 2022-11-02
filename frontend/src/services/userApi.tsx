import {createApi} from "@reduxjs/toolkit/query/react"
import baseQuery from "../utils/baseQuery"

export const userApi = createApi({
    reducerPath: "userApi",
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
        deleteAccount: builder.mutation({
            query: (body: {
                username: string | null
                token: string | null
            }) => {
                return {
                    url: `/user/${body.username}`,
                    method: "DELETE",
                    headers: {authorization: `Bearer ${body.token}`},
                }
            },
        }),
    }),
})

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useDeleteAccountMutation,
} = userApi
