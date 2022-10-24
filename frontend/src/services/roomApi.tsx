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
                // url: body.url,
                url: "/room",
                method: "GET",
                headers: {authorization: `Bearer ${body.token}`},
            }),
        }),
    }),
})

export const {
    useGetRoomQuery,
    useGetUserRoomsQuery,
    useCreateRoomMutation,
} = roomApi

