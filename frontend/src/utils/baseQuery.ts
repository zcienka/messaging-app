import {fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";

const baseQuery = fetchBaseQuery({
        baseUrl: "https://127.0.0.1:50133/api"
    }
)

export default baseQuery
