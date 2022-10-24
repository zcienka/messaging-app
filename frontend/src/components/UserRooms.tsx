import React, {useEffect, useState} from "react"
import {useGetUserRoomsQuery} from "../services/roomApi"
import {JwtToken} from "../utils/JwtToken";

const UserRooms = () => {
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")
    const [url, setUrl] = useState<string | undefined>(undefined)
    const [rooms, setRooms] = useState<any[]>([])

    const {
        data: getUserRoomsData,
        isFetching: isGetUserRoomsFetching,
        isSuccess: isGetUserRoomsSuccess,
        isError: isGetUserRoomsError,
    } = useGetUserRoomsQuery(
        {
            token: jwtToken.token,
            url: url === undefined ? "/room" : url
        })

    useEffect(() => {
        if (isGetUserRoomsSuccess && !isGetUserRoomsFetching) {
            setRooms((prevRooms: any) => Array.from(new Map([...prevRooms, ...getUserRoomsData.results].map((x: any) => [x['id'], x])).values()))

        }
    }, [getUserRoomsData, isGetUserRoomsSuccess, isGetUserRoomsFetching])

    console.log({rooms})

    if (isGetUserRoomsFetching) {
        return <>loading</>
    } else {
        return <>
            <div>

            </div>
        </>
    }
}

export default UserRooms
