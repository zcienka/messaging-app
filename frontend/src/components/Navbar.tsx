import React, {useCallback, useEffect, useRef, useState} from "react"
import {ReactComponent as BurgerNav} from "../imgs/burgerNavIcon.svg"
import {ReactComponent as SettingsIcon} from "../imgs/settingsIcon.svg"
import {logout} from "../features/authSlice"
import {useAppDispatch} from "../app/hooks"
import {useDeleteAccountMutation} from "../services/userApi"
import {DecodedToken, JwtToken} from "../utils/JwtToken"
import jwtDecode from "jwt-decode";
import {useNavigate} from "react-router-dom";
import {ReactComponent as MagnifyingGlass} from "../imgs/magnifyingGlass.svg";
import Chat from "../pages/Chat";
import {Room} from "../utils/Room";
import {useCreateRoomMutation, useGetUserRoomsQuery, useSearchRoomByUsernameQuery} from "../services/roomApi";
import {ReactComponent as ErrorIcon} from "../imgs/errorIcon.svg";
import {ReactComponent as CloseXMark} from "../imgs/closeXMark.svg";
import Loading from "./Loading"

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false)
    const [showRooms, setShowRooms] = useState(false)
    const [user, setUser] = useState<string | null>(null)
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")

    const [chatId, setChatId] = useState<string | null>(null)
    const [username, setUsername] = useState<string>()
    const [currentUserUsername, setCurrentUserUsername] = useState<string>()
    const [checkUsername, setCheckUsername] = useState<boolean>(false)
    const [rooms, setRooms] = useState<Room[]>([])
    const [url, setUrl] = useState<string | undefined>(undefined)
    const [hasMore, setHasMore] = useState(false)

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
            error: createRoomError,
        }
    ] = useCreateRoomMutation()

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

    const {
        data: searchUsernameData,
        isSuccess: isSearchUsernameSuccess,
        isError: isSearchUsernameError,
        error: searchUsernameError,
    } = useSearchRoomByUsernameQuery({
        username: username,
        token: jwtToken.token,
    }, {skip: !checkUsername})

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


    useEffect(() => {
        if (isSearchUsernameSuccess && searchUsernameData !== undefined && searchUsernameData.length !== 0) {
            setChatId(() => searchUsernameData[0].id)
        } else if (searchUsernameError !== undefined &&
            "data" in searchUsernameError &&
            searchUsernameError.status === 401) {
            navigate("/login")
        }
    }, [jwtToken.token, searchUsernameError, navigate, createRoom, currentUserUsername,
        isSearchUsernameSuccess, searchUsernameData])

    useEffect(() => {
        const createNewRoom = async () => {
            await createRoom({users: [username, currentUserUsername], token: jwtToken.token})
        }

        if (searchUsernameData !== undefined && searchUsernameData.length === 0) {
            createNewRoom()
        }
    }, [username, createRoom, searchUsernameData, currentUserUsername, jwtToken.token])


    useEffect(() => {
        if (isCreateRoomSuccess) {
            setChatId(() => createRoomData.id)
        } else {
            if (createRoomError !== undefined &&
                "data" in createRoomError &&
                createRoomError.status === 401) {
                navigate("/login")
            }
        }
    }, [navigate, createRoomError, createRoomData, isCreateRoomSuccess])

    useEffect(() => {
        if (localStorage.getItem("user") !== null && jwtToken.token !== null) {
            const accessToken: DecodedToken = jwtDecode(jwtToken.token)
            setUser(accessToken.username)
        }
    }, [jwtToken.token])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setCheckUsername(() => true)
        } else {
            setCheckUsername(() => false)
        }
    }
    const allRooms = rooms.map((room: Room, index: number) => {
        if (rooms.length === index + 1) {
            return <div key={room.id}
                        className={"mt-2 mx-2 rounded-xl p-4 bg-gray-200 cursor-pointer min-w-2xl"}
                        onClick={(e) => {
                            setChatId(() => room.id)
                            setShowRooms(() => false)
                        }}>
                <span ref={lastRoomRef}>
                    <p className={"font-bold text-ellipsis max-h-m truncate"}>
                        {room.lastMessage}
                    </p>
                </span>
            </div>
        } else {
            return <div key={room.id}
                        className={"mt-2 mx-2 rounded-xl p-4 bg-gray-200 cursor-pointer"}
                        onClick={(e) => {
                            setChatId(() => room.id)
                            setShowRooms(() => false)
                        }}>
                <div className={"text-ellipsis max-h-m truncate"}>
                    <p className={"font-bold text-ellipsis max-h-m truncate"}>
                        {room.lastMessage}
                    </p>
                </div>
            </div>
        }
    })
    if (isGetUserRoomsFetching && rooms.length === 0) {
        return <Loading/>
    } else {
        return <div>
            {searchUsernameError !== undefined &&
            // @ts-ignore
            searchUsernameError.originalStatus === 404 ? <NoUsersFound isError={isSearchUsernameError}/> : null}
            <div className={"h-16 bg-white border-b-2 border-gray-100 h-full"}>
                <div className={"flex p-2 w-full"}>
                    <div className={"md:invisible flex"}>
                        <div className={"flex items-center w-12 p-2 cursor-pointer"}>
                            <BurgerNav className={""} onClick={() => setShowRooms(() => !showRooms)}/>
                        </div>
                    </div>
                    <div className={"flex justify-end w-full"}>
                        <div className={"flex items-center w-12 p-2 cursor-pointer"}>
                            {user !== null ?
                                <SettingsIcon className={""} onClick={() => setShowDropdown(!showDropdown)}/> : null}
                        </div>
                    </div>
                </div>
            </div>
            <div className={`${showDropdown ? "flex" : "hidden"}`}>
                <Dropdown user={user} accessToken={jwtToken.token}/>
            </div>
            <div className={"flex  flex-row h-[calc(100vh_-_8.1rem)]"}>
                <div className={`${showRooms ? "w-full md:w-fit visible md:inline-block" : "md:visible invisible absolute md:static"}`}>
                    <div
                        className={"w-full md:w-96 h-[calc(100vh_-_4.1rem)] bg-gray-50 border-x-2 border-gray-100 overflow-y-auto"}>
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
                </div>
                {chatId !== null ? <div className={"w-full md:w-[calc(100vw_-_24rem)]"}>
                    <Chat chatId={chatId}/>
                </div> : null}
            </div>
        </div>
    }
}

interface DropdownProps {
    user: string | null,
    accessToken: string | null,
}

const Dropdown = (props: DropdownProps) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [
        deleteAccount,
        {
            isSuccess: isDeleteAccountSuccess,
            isError: isDeleteAccountError,
        }
    ] = useDeleteAccountMutation()

    const deleteUser = () => {
        deleteAccount({username: props.user, token: props.accessToken})
    }

    useEffect(() => {
        if (isDeleteAccountSuccess) {
            dispatch(logout())
            navigate("/login")
        }
    }, [navigate, dispatch, isDeleteAccountSuccess])

    return <div className={"right-0 absolute rounded-b-xl border-x-2 border-b-2 border-gray-100"}>
        <aside className="w-full md:w-64" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-white rounded-b-xl">
                <ul className="space-y-2">
                    <li>
                        <div
                            className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                dispatch(logout());
                                navigate("/login")
                            }}>
                            <span className="ml-3">Log out</span>
                        </div>
                    </li>
                    <li>
                        <div
                            className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => deleteUser()}>
                            <span className="ml-3">Delete the account</span>
                        </div>
                    </li>
                </ul>
            </div>
        </aside>
    </div>
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

export default Navbar
