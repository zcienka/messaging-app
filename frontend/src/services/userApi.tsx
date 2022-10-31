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
        searchUsername: builder.query({
            query: (body) => ({
                url: `/user/${body.username}`,
                method: "GET",
                headers: {authorization: `Bearer ${body.token}`},
            }),
        }),
    }),
})

export const {
    useLoginUserMutation,
    useRegisterUserMutation,
    useSearchUsernameQuery
} = userApi
