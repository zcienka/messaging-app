import {createApi} from "@reduxjs/toolkit/query/react"
import baseQuery from "../utils/baseQuery"

export const roomApi = createApi({
    reducerPath: "roomApi",
    baseQuery: baseQuery,
    endpoints: (builder) => ({
        getRoom: builder.query({
            query: (body) => ({
                url: body.url,
                method: "GET",
                headers: {authorization: `Bearer ${body.token}`},
            }),
        }),
        createRoom: builder.mutation({
            query: (body) => ({
                url: "/room",
                method: "POST",
                body: body.users,
                headers: {authorization: `Bearer ${body.token}`},
            }),
        }),
        getUserRooms: builder.query({
            query: (body) => ({
                url: body.url,
                method: "GET",
                headers: {authorization: `Bearer ${body.token}`},
            }),
        }),
        searchRoomByUsername: builder.query({
            query: (body) => ({
                url: `room/exists/user/${body.username}`,
                method: "GET",
                headers: {authorization: `Bearer ${body.token}`},
                body: body.data,
            }),
        }),
    }),
})

export const {
    useGetRoomQuery,
    useGetUserRoomsQuery,
    useCreateRoomMutation,
    useSearchRoomByUsernameQuery
} = roomApi

