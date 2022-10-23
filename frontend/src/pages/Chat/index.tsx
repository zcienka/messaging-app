import React, {useState, useEffect, useCallback, useRef} from "react"
import {HubConnection, LogLevel} from "@microsoft/signalr"
import {HubConnectionBuilder} from "@microsoft/signalr"
import {Message, MessageRequest} from "../../utils/Message"
import {DecodedToken, JwtToken} from "../../utils/JwtToken"
import {useGetRoomQuery} from "../../services/roomApi"
import {useParams} from "react-router-dom"
import jwtDecode from "jwt-decode"
import {useNavigate} from "react-router-dom"
import MessageStyle from "../../components/MessageStyle"
import Navbar from "../../components/Navbar";

const Chat = () => {
    const [messageRequest, setMessageRequest] = useState<MessageRequest>()
    const [messages, setMessages] = useState<any[]>([])
    const [user, setUser] = useState<string>()
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [roomId, setRoomId] = useState<string | undefined>(undefined)
    const [jwtToken, setJwtToken] = useState<JwtToken>(JSON.parse(localStorage.getItem("user") || "{}"))
    const [url, setUrl] = useState<string | undefined>(undefined)
    const [hasMore, setHasMore] = useState(false)

    const params = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        setRoomId(params.id)
    }, [params])

    useEffect(() => {
        if (roomId !== undefined && user !== undefined) {
            const joinRoom = async () => {
                try {
                    const connection = new HubConnectionBuilder()
                        .withUrl("https://localhost:50133/chat",)
                        .configureLogging(LogLevel.Information)
                        .build()

                    connection.on("ReceiveMessage", (message) => {
                        setMessages((chatMessages: any) => [message, ...chatMessages])
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
    }, [user, roomId])

    const {
        data: getRoomData,
        isFetching: isGetRoomFetching,
        isSuccess: isGetRoomSuccess,
        isError: isGetRoomError,
    } = useGetRoomQuery(
        {
            roomId: params.id,
            token: jwtToken.token,
            url: url === undefined ? `/room/${params.id}` : url
        })

    useEffect(() => {
        if (isGetRoomSuccess && localStorage.getItem("user") !== null && jwtToken.token !== null) {
            const accessToken: DecodedToken = jwtDecode(jwtToken.token)
            setUser(accessToken.username)
        } else if (localStorage.getItem("user") === null || isGetRoomError) {
            navigate("/login")
        }
    }, [isGetRoomError, navigate, isGetRoomSuccess, jwtToken.token])

    useEffect(() => {
        if (isGetRoomSuccess) {
            // setMessages((oldMessage: any) => [...oldMessage, ...getRoomData.messages.results])
            setMessages((oldMessage: any) =>
                Array.from(new Map([...oldMessage, ...getRoomData.messages.results].map((x: any) => [x['id'], x])).values()))
        }
    }, [getRoomData, isGetRoomSuccess])

    const sendMessage = async () => {
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
        if (getRoomData.messages.next) {
            setHasMore(true)
        } else {
            setHasMore(false)
        }

        if (observer.current) {
            observer.current.disconnect()
        }
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setUrl(getRoomData.messages.next)
            } else {
                setUrl(undefined)
            }
        })
        if (node) {
            observer.current.observe(node)
        }
    }, [getRoomData?.messages.next, hasMore])

    const allMessages = [...messages].map((message: Message, index: number) => {
        if (user !== undefined)
            if (messages.length === index + 1) {
                return <div key={message.id}>
                        <span ref={lastMessageRef}>
                            <MessageStyle message={message} user={user}/>
                        </span>
                </div>
            } else {
                return <div key={message.id}>
                    <MessageStyle message={message} user={user}/>
                </div>
            }
    })


    if (roomId === undefined || isGetRoomFetching)
        return (<>loading...</>)
    else {
        return (
            <>
                <Navbar/>
                <div className={"h-[calc(100vh_-_8rem)] flex flex-col px-2"}>
                    <div className={"flex flex-col overflow-y-auto overflow-x-hidden"}>
                        {allMessages}
                        {/*{getRoomData.messages.next !== null ?*/}
                        {/*    <div className={"flex w-full justify-center"}>*/}
                        {/*        <button className={"w-64"} onClick={() => setUrl(() => getRoomData.messages.next)}>*/}
                        {/*            Load more messages*/}
                        {/*        </button>*/}
                        {/*    </div> : null}*/}
                    </div>
                </div>

                <div className={"flex h-16 w-full border-t-2 border-gray-200"}>
                    <div className={"flex flex-row w-full h-full items-center px-2"}>
                        <input className={"w-full mr-2"} onChange={(e) => {
                            setMessageRequest({
                                text: e.target.value,
                                roomId: roomId,
                                authorUsername: user
                            })
                        }}/>
                        <button className={"confirm-button w-24"} onClick={() => sendMessage()}>Send</button>
                    </div>
                </div>
            </>
        )
    }
}

export default Chat
