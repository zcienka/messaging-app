import React, {useState, useEffect, useCallback, useRef} from "react"
import {HubConnection, LogLevel} from "@microsoft/signalr"
import {HubConnectionBuilder, HttpTransportType} from "@microsoft/signalr"
import {Message, MessageRequest} from "../../utils/Message"
import {DecodedToken, JwtToken} from "../../utils/JwtToken"
import {useGetRoomQuery} from "../../services/roomApi"
import {useParams} from "react-router-dom"
import jwtDecode from "jwt-decode"
import {Link, useNavigate} from "react-router-dom"
import moment from "moment"

const Chat = () => {
    const [messageRequest, setMessageRequest] = useState<MessageRequest>()
    const [messages, setMessages] = useState<any[]>([])
    const [users, setUsers] = useState<string[]>()
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

    const {
        data: getRoomData,
        isFetching: isGetRoomFetching,
        isSuccess: isGetRoomSuccess
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
        }
    }, [navigate, isGetRoomSuccess, jwtToken.token])

    useEffect(() => {
        if (isGetRoomSuccess) {
            setMessages((chatMessages: any) => [...chatMessages, ...getRoomData.messages.results] )
            setMessages((chatMessages: any) => Array.from(new Map(chatMessages.map((x: any) => [x['id'], x])).values()))
        }
    }, [getRoomData, isGetRoomSuccess])

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
            }
            else {
                setUrl(undefined)
            }
        })
        if (node) {
            observer.current.observe(node)
        }
    }, [getRoomData?.messages.next, hasMore])
    const observer = useRef<IntersectionObserver | null>(null)

    const joinRoom = async () => {
        try {
            const connection = new HubConnectionBuilder()
                .withUrl("https://localhost:50133/chat", {
                    skipNegotiation: true,
                    transport: HttpTransportType.WebSockets,
                })
                .configureLogging(LogLevel.Information)
                .build()

            connection.on("ReceiveMessage", (message) => {
                setMessages((chatMessages: any) => [message, ...chatMessages])
            })

            connection.on("UsersInRoom", (users) => {
                setUsers(users)
            })

            connection.onclose(() => {
                setConnection(null)
                setUsers([])
            })

            await connection.start()

            await connection.invoke("JoinRoom", {user: user, room: roomId})

            setConnection(connection)
        } catch (e) {
            console.log(e)
        }
    }

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

    const allMessages = [...messages].reverse().map((message: Message, index: number) => {
        if (messages.length === index + 1) {
            return <div key={message.id}>
                <span ref={lastMessageRef}>
                    {message.text}{' '}
                    {message.authorUsername}{' '}
                    {moment(message.created).fromNow()}
                </span>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
        } else {
            return <div key={message.id}>
                {message.text}{' '}
                {message.authorUsername}{' '}
                {moment(message.created).fromNow()}
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </div>
        }
    })

    if (roomId === undefined || isGetRoomFetching)
        return (<>loading...</>)
    else {
        return (
            <>
                <br/>
                <br/>
                <p>Message</p>
                <input onChange={(e) => {
                    setMessageRequest({
                        text: e.target.value,
                        roomId: roomId,
                        authorUsername: user
                    })
                }}/>
                <p>Server messages:</p>
                {allMessages}
                <br/>
                <br/>
                <button className={"confirm-button"} onClick={() => sendMessage()}>Send</button>
                <button onClick={() => joinRoom()}>join room</button>
                <br/>
                <br/>
            </>
        )
    }
}

export default Chat
