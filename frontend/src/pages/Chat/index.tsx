import React, {useState, useEffect, useCallback, useRef} from "react"
import {HubConnection, LogLevel} from "@microsoft/signalr"
import {HubConnectionBuilder} from "@microsoft/signalr"
import {Message, MessageRequest} from "../../utils/Message"
import {DecodedToken, JwtToken} from "../../utils/JwtToken"
import {useGetRoomQuery} from "../../services/roomApi"
import jwtDecode from "jwt-decode"
import {useNavigate} from "react-router-dom"
import SingleMessage from "../../components/SingleMessage"
import {RoomRequest} from "../../utils/Room"
import {v4 as uuidv4} from "uuid"
import Loading from "../../components/Loading";

interface Props {
    chatId: string,
}

const Chat = (props: Props) => {
    const [messageRequest, setMessageRequest] = useState<MessageRequest>()
    const [messages, setMessages] = useState<Message[]>([])
    const [user, setUser] = useState<string>()
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [roomId, setRoomId] = useState<string | undefined>(undefined)
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")
    const [url, setUrl] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [allMessages, setAllMessages] = useState<any[]>([]);
    const [users, setUsers] = useState<undefined | any[]>([]);

    const inputRef = useRef<HTMLInputElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        setRoomId(props.chatId)
    }, [props.chatId])

    useEffect(() => {
        if (props.chatId !== undefined && user !== undefined) {
            const joinRoom = async () => {
                try {
                    const connection = new HubConnectionBuilder()
                        .withUrl("https://localhost:50133/chat",)
                        .configureLogging(LogLevel.Information)
                        .build()

                    connection.on("ReceiveMessage", (message) => {
                        setMessages((chatMessages: any) => Array.from(new Map([message, ...chatMessages].map((x: any) => [x["id"], x])).values()))
                    })

                    connection.onclose(() => {
                        setConnection(null)
                    })

                    await connection.start()

                    await connection.invoke("JoinRoom", {user: user, room: roomId})

                    setConnection(connection)
                } catch (e) {
                    console.log(e)
                }
            }
            joinRoom()
        }
    }, [props.chatId, user, roomId])

    const {
        data: getRoomData,
        isFetching: isGetRoomFetching,
        isSuccess: isGetRoomSuccess,
        isError: isGetRoomError,
        refetch
    } = useGetRoomQuery(
        {
            roomId: props.chatId,
            token: jwtToken.token,
            url: url === null ? `/room/${props.chatId}` : url,
        } as RoomRequest)

    useEffect(() => {
        refetch()
        setAllMessages(() => [])
        setMessages(() => [])
        setUsers(() => [])
    }, [refetch, props.chatId])

    useEffect(() => {
        if (isGetRoomSuccess && localStorage.getItem("user") !== null && jwtToken.token !== null) {
            const accessToken: DecodedToken = jwtDecode(jwtToken.token)
            setUser(accessToken.username)
        } else if (localStorage.getItem("user") === null || isGetRoomError) {
            navigate("/login")
        }
    }, [isGetRoomError, navigate, isGetRoomSuccess, jwtToken.token])

    useEffect(() => {
        if (isGetRoomSuccess && !isGetRoomFetching && getRoomData.messages !== undefined) {
            setMessages((prevMessage: any) =>
                Array.from(new Map([...prevMessage, ...getRoomData.messages.results].map((x: any) => [x["id"], x])).values()))
            setUsers(getRoomData.usernames.filter((username: string) => username !== user))
        }
    }, [isGetRoomFetching, getRoomData, isGetRoomSuccess, props.chatId, user])

    const sendMessage = async () => {
        if (inputRef.current !== null) {
            inputRef.current.value = ''
        }
        if (connection !== null) {
            try {
                await connection.send("SendMessage", messageRequest)
            } catch (e) {
                console.log(e)
            }
        } else {
            alert("No connection to server yet.")
        }
    }
    const observer = useRef<IntersectionObserver | null>(null)

    const lastMessageRef = useCallback((node: any) => {
        if (getRoomData !== undefined && getRoomData.messages.next) {
            setHasMore(true)
        } else {
            setHasMore(false)
        }

        if (observer.current) {
            observer.current.disconnect()
        }
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && getRoomData !== undefined) {
                setUrl(getRoomData.messages.next)
            } else {
                setUrl(null)
            }
        })
        if (node) {
            observer.current.observe(node)
        }
    }, [hasMore, getRoomData])

    useEffect(() => {
        if (user !== undefined) {
            setAllMessages([...messages].map((message: Message, index: number) => {
                if (messages.length === index + 1) {
                    return <div key={uuidv4()}>
                        <span ref={lastMessageRef}>
                            <SingleMessage message={message} user={user}/>
                        </span>
                    </div>
                } else {
                    return <div key={uuidv4()}>
                        <SingleMessage message={message} user={user}/>
                    </div>
                }
            }))
        }
    }, [lastMessageRef, messages, user])

    if (roomId === undefined || users === undefined)
        return (<Loading/>)
    else {
        const allUsers = users.map((username: string, count: number) => {
            if (users.length > 2 && count === users.length - 1) {
                return <span key={uuidv4()}>
                    and others
                </span>
            } else if (count === users.length - 1) {
                return <span className={"pl-1"} key={uuidv4()}>
                    {username}
                </span>
            } else {
                return <span key={uuidv4()}>
                    {username},
                </span>
            }
        })

        return (
            <>
                <div className={"h-full flex flex-col px-2"}>
                    <div className={"h-10 border-b pb-2 flex items-center text-xl"}>
                        {allUsers}
                    </div>
                    <div className={"flex flex-col-reverse overflow-y-auto overflow-x-hidden pt-2"}>
                        {allMessages}
                    </div>
                </div>

                <div className={"flex h-16 w-full border-t-2 border-gray-100"}>
                    <div className={"flex flex-row w-full h-full items-center px-2"}>
                        <input className={"w-full mr-2"} ref={inputRef} onChange={(e) => {
                            setMessageRequest({
                                text: e.target.value,
                                roomId: roomId,
                                authorUsername: user
                            })
                        }}/>
                        <button className={"confirm-button w-24"} onClick={() => sendMessage()}>
                            Send
                        </button>
                    </div>
                </div>
            </>
        )
    }
}

export default Chat
