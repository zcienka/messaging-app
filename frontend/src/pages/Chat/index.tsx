import React, {useState, useEffect, useCallback, useRef} from "react"
import {HubConnection, LogLevel} from "@microsoft/signalr"
import {HubConnectionBuilder, HttpTransportType} from "@microsoft/signalr"
import {Message, MessageRequest} from "../../utils/Message"
import {DecodedToken, JwtToken} from "../../utils/JwtToken"
import {useGetRoomQuery} from "../../services/roomApi"
import {useParams} from "react-router-dom"
import jwtDecode from "jwt-decode"
import {useNavigate} from "react-router-dom"
import MessageStyle from "../../components/MessageStyle"

const Chat = () => {
    const [messageRequest, setMessageRequest] = useState<MessageRequest>()
    const [messages, setMessages] = useState<any[]>([])
    const [users, setUsers] = useState<string[]>()
    const [user, setUser] = useState<string>()
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [roomId, setRoomId] = useState<string | undefined>(undefined)
    const [jwtToken, setJwtToken] = useState<JwtToken>(JSON.parse(localStorage.getItem("user") || "{}"))
    const [url, setUrl] = useState<string | undefined>(undefined)


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
            joinRoom()
        }
    }, [user, roomId])

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

    const allMessages = [...messages].map((message: Message, index: number) => {
        if (user !== undefined)
            return <div key={message.id}>
                <MessageStyle message={message} user={user}/>
            </div>
    })

    if (roomId === undefined || isGetRoomFetching)
        return (<>loading...</>)
    else {
        return (
            <>
                <div className={"h-screen flex flex-col mt-10"}>
                <div className={"border-2 border-blue-400  min-h-screen flex flex-col-reverse overflow-y-auto overflow-x-hidden"}>
                        {allMessages}
                </div>
                </div>

                <div className={"sticky"}>

                    <div className={"flex flex-row"}>
                        <input className={"w-full"} onChange={(e) => {
                            setMessageRequest({
                                text: e.target.value,
                                roomId: roomId,
                                authorUsername: user
                            })
                        }}/>
                        <button className={"confirm-button"} onClick={() => sendMessage()}>Send</button>
                    </div>
                </div>
            </>
        )
    }
}

export default Chat
