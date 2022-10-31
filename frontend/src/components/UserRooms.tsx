import React, {useCallback, useEffect, useRef, useState} from "react"
import {useCreateRoomMutation, useGetUserRoomsQuery} from "../services/roomApi"
import {DecodedToken, JwtToken} from "../utils/JwtToken"
import {Room} from "../utils/room"
import Chat from "../pages/Chat"
import Navbar from "../components/Navbar"
import {useNavigate} from "react-router-dom"
import {ReactComponent as MagnifyingGlass} from "../imgs/magnifyingGlass.svg"
import {useSearchUsernameQuery} from "../services/userApi";
import jwtDecode from "jwt-decode";

const UserRooms = () => {
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")
    const [url, setUrl] = useState<string | undefined>(undefined)
    const [rooms, setRooms] = useState<Room[]>([])
    const [hasMore, setHasMore] = useState(false)
    const [chatId, setChatId] = useState<string | null>(null)
    const [username, setUsername] = useState<string>()
    // const [searchUsername, setSearchUsername] = useState<string>()
    const [checkUsername, setCheckUsername] = useState<boolean>(false)

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

    const [
        createRoom,
        {
            data: createRoomData,
            isSuccess: isCreateRoomSuccess,
            isError: isCreateRoomError,
        }
    ] = useCreateRoomMutation()
    // token: jwtToken.token,
    // )

    const {
        data: searchUsernameData,
        isSuccess: isSearchUsernameSuccess,
        isError: isSearchUsernameError,
    } = useSearchUsernameQuery({
        username: username,
        token: jwtToken.token,
    }, {skip: !checkUsername})

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
        } else if (isGetUserRoomsSuccess && jwtToken.token !== null) {
            const accessToken: DecodedToken = jwtDecode(jwtToken.token)
            // setUser(accessToken.username)
        }
    }, [isGetUserRoomsSuccess, isGetUserRoomsError, navigate, jwtToken.token])

    useEffect(() => {
        if (isGetUserRoomsSuccess && !isGetUserRoomsFetching) {
            setRooms((prevRooms: any) =>
                Array.from(new Map([...prevRooms, ...getUserRoomsData.results].map((x: any) => [x["id"], x])).values()))
        }
    }, [getUserRoomsData, isGetUserRoomsSuccess, isGetUserRoomsFetching])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setCheckUsername(() => true)
        }
    }
    console.log({searchUsernameData})

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
                        onClick={(e) => setChatId(() => room.id)}>
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

                        <div className={"flex justify-begin items-center relative w-full"}>
                            <div className={"absolute pl-3 text-gray-400"}>
                                <MagnifyingGlass/>
                            </div>
                            <input className={"p-1 px-3 rounded-xl w-full pl-10"}
                                   placeholder={"Search by username"}
                                   onKeyDown={handleKeyDown}
                                   onChange={(e) => setUsername(e.target.value)}/>
                        </div>
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
