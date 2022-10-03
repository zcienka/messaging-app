import {createApi} from "@reduxjs/toolkit/query/react"
import baseQuery from "../utils/baseQuery"


export const roomApi = createApi({
    reducerPath: "roomApi",
    baseQuery: baseQuery,
    tagTypes: ["Room"],

    endpoints: (builder) => ({
        getRoom: builder.query({
            query: (body) => ({
                url: `/room/${body.roomId}`,
                method: "GET",
                headers: {authorization: `Bearer ${body.token}`},
            }),
            providesTags: ["Room"],
        }),
        createRoom: builder.mutation({
            query: (body) => ({
                url: "/room",
                method: "POST",
                body: body.users,
                headers: {authorization: `Bearer ${body.token}`},
            }),
            invalidatesTags: ["Room"],
        }),
    }),

})

export const {
    useGetRoomQuery,
    useCreateRoomMutation,
} = roomApi

