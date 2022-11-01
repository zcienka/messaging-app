import React, {FC, useCallback, useEffect, useRef, useState} from "react"
import {useCreateRoomMutation, useGetUserRoomsQuery} from "../services/roomApi"
import {DecodedToken, JwtToken} from "../utils/JwtToken"
import {Room, UserChatroomsResponse} from "../utils/Room"
import Chat from "../pages/Chat"
import Navbar from "../components/Navbar"
import {useNavigate} from "react-router-dom"
import {ReactComponent as MagnifyingGlass} from "../imgs/magnifyingGlass.svg"
import {ReactComponent as CloseXMark} from "../imgs/closeXMark.svg"
import {ReactComponent as ErrorIcon} from "../imgs/errorIcon.svg"
import {useSearchUsernameQuery} from "../services/userApi"
import jwtDecode from "jwt-decode"

const UserRooms = () => {
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")
    const [url, setUrl] = useState<string | undefined>(undefined)
    const [rooms, setRooms] = useState<Room[]>([])
    const [hasMore, setHasMore] = useState(false)
    const [chatId, setChatId] = useState<string | null>(null)
    const [username, setUsername] = useState<string>()
    const [currentUserUsername, setCurrentUserUsername] = useState<string>()
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
            setCurrentUserUsername(accessToken.username)
        }
    }, [isGetUserRoomsSuccess, isGetUserRoomsError, navigate, jwtToken.token])

    useEffect(() => {
        if (isGetUserRoomsSuccess && !isGetUserRoomsFetching) {
            setRooms((prevRooms: any) =>
                Array.from(new Map([...prevRooms, ...getUserRoomsData.results].map((x: any) => [x["id"], x])).values()))
        }
    }, [getUserRoomsData, isGetUserRoomsSuccess, isGetUserRoomsFetching])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setCheckUsername(() => true)
        } else {
            setCheckUsername(() => false)
        }
    }

    useEffect(() => {
        if (isSearchUsernameSuccess) {
            if (isAlreadyInChatRoom({searchUsernameData, currentUserUsername})) {
                setChatId(() => getChatId({searchUsernameData, currentUserUsername}))
            }
        }
    }, [currentUserUsername, isSearchUsernameSuccess, searchUsernameData])
    
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
            {isSearchUsernameError ? <NoUsersFound isError={isSearchUsernameError}/> : null}
            <Navbar/>
            <div className={"flex flex-row h-[calc(100vh_-_8rem)]"}>
                <div className={"w-96 h-[calc(100vh_-_4rem)] bg-gray-50 border-x-2 border-gray-100 overflow-y-auto"}>
                    <div className={"flex justify-center w-full p-2"}>

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

interface NoUsersFoundProps {
    isError: boolean
}

const NoUsersFound = ({isError}: NoUsersFoundProps) => {
    const [exit, setExit] = useState<boolean>(isError)

    return <div
        className={`${exit ? "visible" : "invisible"} bg-neutral-900 bg-opacity-50 w-screen h-screen absolute z-20`}>
        <div className={"flex items-center justify-center h-screen"}>
            <div className={"w-80 h-52 bg-slate-50 rounded-2xl p-2"}>
                <div className={"flex w-full h-full "}>
                    <div className={"flex flex-column items-center justify-center w-full"}>
                        <div className="mr-1">
                            <ErrorIcon/>
                        </div>
                        <p>This user does not exist.</p>
                    </div>
                    <div className={"flex justify-start"}>
                        <span className={"h-min cursor-pointer hover:text-gray-500"}
                              onClick={() => setExit(() => !exit)}>
                            <CloseXMark/>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

interface ChatRoomProps {
    searchUsernameData: any,
    currentUserUsername: string | undefined,
}

const isAlreadyInChatRoom = (props: ChatRoomProps) => {
    const chat = props.searchUsernameData.map((chatRoom: UserChatroomsResponse) => {
            return chatRoom.usernames.find((username: string) => username === props.currentUserUsername) !== undefined
        }
    )
    return chat.length !== 0
}

const getChatId = (props: ChatRoomProps) => {
    const chat = props.searchUsernameData.map((chatRoom: UserChatroomsResponse) => {
            if(chatRoom.usernames.find((username: string) => username === props.currentUserUsername) !== undefined)
                return chatRoom.id
        }
    )
    return chat[0]
}


export default UserRooms
