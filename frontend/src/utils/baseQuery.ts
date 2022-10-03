import {fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {RootState} from "../app/store";

const baseQuery = fetchBaseQuery({
        baseUrl: "https://127.0.0.1:50133/api"
    }
)

export default baseQuery
