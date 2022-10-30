import React, {useCallback, useEffect, useRef, useState} from "react"
import {useGetUserRoomsQuery} from "../services/roomApi"
import {DecodedToken, JwtToken} from "../utils/JwtToken"
import {Room} from "../utils/room"
import Chat from "../pages/Chat"
import Navbar from "../components/Navbar"
import jwtDecode from "jwt-decode";
import {useNavigate} from "react-router-dom";

const UserRooms = () => {
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")
    const [url, setUrl] = useState<string | undefined>(undefined)
    const [rooms, setRooms] = useState<Room[]>([])
    const [hasMore, setHasMore] = useState(false)
    const [chatId, setChatId] = useState<string | null>(null)
    const navigate = useNavigate()

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

    const lastRoomRef = useCallback((node: any) => {
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
        if (localStorage.getItem("user") === null || isGetUserRoomsError) {
            navigate("/login")
        }
    }, [isGetUserRoomsError, navigate, isGetUserRoomsSuccess, jwtToken.token])

    useEffect(() => {
        if (isGetUserRoomsSuccess && !isGetUserRoomsFetching) {
            setRooms((prevRooms: any) => Array.from(new Map([...prevRooms, ...getUserRoomsData.results].map((x: any) => [x["id"], x])).values()))
        }
    }, [getUserRoomsData, isGetUserRoomsSuccess, isGetUserRoomsFetching])

    const allRooms = rooms.map((room: Room, index: number) => {
        if (rooms.length === index + 1) {
            return <div key={room.id}
                        className={"mt-2 mx-2 rounded-xl p-4 bg-gray-200 cursor-pointer min-w-2xl"}
                        onClick={() => setChatId(() => room.id)}>
                <span ref={lastRoomRef}>
                    <p className={"font-bold text-ellipsis max-h-m truncate"}>{room.lastMessage}</p>
                </span>
            </div>
        } else {
            return <div key={room.id}
                        className={"mt-2 mx-2 rounded-xl p-4 bg-gray-200 cursor-pointer"}
                        onClick={() => setChatId(() => room.id)}>
                <div className={"text-ellipsis max-h-m truncate"}>
                    <p className={"font-bold text-ellipsis max-h-m truncate"}>{room.lastMessage}</p>
                </div>
            </div>
        }
    })

    if (isGetUserRoomsFetching && rooms.length === 0) {
        return <>loading</>
    } else {
        return <>
            <Navbar/>
            <div className={"flex flex-row h-[calc(100vh_-_8rem)]"}>
                <div className={"w-96 h-[calc(100vh_-_4rem)] bg-gray-50 border-x-2 border-gray-100 overflow-y-auto"}>
                    <div className={"flex justify-center w-full p-2 "}>
                        <input className={"p-1 rounded-xl w-full"}/>
                    </div>
                    {allRooms}
                </div>
                {chatId !== null ? <div className={"w-[calc(100vw_-_24rem)]"}>
                    <Chat chatId={chatId}/>
                </div> : null}
            </div>
        </>
    }
}

export default UserRooms
