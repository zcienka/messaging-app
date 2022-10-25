import React, {useCallback, useEffect, useRef, useState} from "react"
import {useGetUserRoomsQuery} from "../services/roomApi"
import {JwtToken} from "../utils/JwtToken"
import MessageStyle from "./MessageStyle";
import {Room} from "../utils/room";
import Chat from "../pages/Chat";
import Navbar from "../components/Navbar"

const UserRooms = () => {
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")
    const [url, setUrl] = useState<string | undefined>(undefined)
    const [rooms, setRooms] = useState<Room[]>([])
    const [hasMore, setHasMore] = useState(false)

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

    const observer = useRef<IntersectionObserver | null>(null)

    const lastMessageRef = useCallback((node: any) => {
        if (getUserRoomsData.next) {
            setHasMore(true)
        } else {
            setHasMore(false)
        }

        if (observer.current) {
            observer.current.disconnect()
        }
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setUrl(getUserRoomsData.next)
            } else {
                setUrl(undefined)
            }
        })
        if (node) {
            observer.current.observe(node)
        }
    }, [getUserRoomsData?.next, hasMore])

    useEffect(() => {
        if (isGetUserRoomsSuccess && !isGetUserRoomsFetching) {
            setRooms((prevRooms: any) => Array.from(new Map([...prevRooms, ...getUserRoomsData.results].map((x: any) => [x["id"], x])).values()))
        }
    }, [getUserRoomsData, isGetUserRoomsSuccess, isGetUserRoomsFetching])

    const allRooms = rooms.map((room: Room, index: number) => {
        if (rooms.length === index + 1) {
            return <div key={room.id} className={"mt-2 mx-2 rounded-xl p-4 bg-gray-200"}>
                <span ref={lastMessageRef}>
                    <p className={"font-bold"}>{room.lastMessage}</p>
                </span>
            </div>
        } else {
            return <div key={room.id}>
                {room.lastMessage}
            </div>
        }
    })
    const chatId: string = "bfc05bceb6414462afc79ee9439d450d"

    if (isGetUserRoomsFetching) {
        return <>loading</>
    } else {
        return <>
            <Navbar/>
            <div className={"flex flex-row h-[calc(100vh_-_8rem)]"}>
                <div className={"w-128 h-[calc(100vh_-_4rem)] bg-gray-50 border-2 border-gray-100"}>
                    {allRooms}
                </div>
                <div className={"w-full"}>
                    <Chat chatId={chatId}/>
                </div>
            </div>
        </>
    }
}

export default UserRooms
