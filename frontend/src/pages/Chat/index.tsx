import React, {useState, useRef, useEffect} from "react"
import {HubConnection} from "@microsoft/signalr"
import Messages from "../Messages"
import {HubConnectionBuilder, HttpTransportType} from "@microsoft/signalr"
import {Message, MessageRequest} from "../../utils/Message"
import {JwtToken} from "../../utils/JwtToken"
import {useGetRoomQuery} from "../../services/roomApi"
import {useParams} from "react-router-dom"

const Chat = () => {
    const [messageRequest, setMessageRequest] = useState<MessageRequest>()
    const [messages, setMessages] = useState<any[]>([])
    const [users, setUsers] = useState<string[]>()
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [roomId, setRoomId] = useState<string | undefined>(undefined)
    const latestChat = useRef<any>(null)
    const [jwtToken, setJwtToken] = useState<JwtToken>(JSON.parse(localStorage.getItem("user") || "{}"))
    const params = useParams()


    useEffect(() => {
        setRoomId(params.id)
    }, [params])

    const {
        data: getRoomData,
        isFetching: isGetRoomFetching,
        isSuccess: isGetRoomSuccess
    } = useGetRoomQuery({roomId: roomId, token: jwtToken.token})

    useEffect(() => {
        if (isGetRoomSuccess) {
            setMessages(getRoomData.messages.results)
        }
    }, [getRoomData, isGetRoomSuccess])


    const joinRoom = async (user: string, room: string) => {
        try {
            const connection = new HubConnectionBuilder()
                .withUrl("https://localhost:50133/chat", {
                    skipNegotiation: true,
                    transport: HttpTransportType.WebSockets
                })
                .build()

            connection.on("ReceiveMessage", (message) => {
                setMessages((chatMessages: any) => [...chatMessages, message])
            })

            connection.on("UsersInRoom", (users) => {
                setUsers(users)
            })

            connection.onclose(e => {
                setConnection(null)
                setUsers([])
            })

            await connection.start()

            await connection.invoke("JoinRoom", {user: "user", room: "a89b7cb2b51d4adb9beea6cfd6d24676"})
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

    const allMessages = messages.map((message: Message) => {
        return <div key={message.id}>
            {message.text}{' '}
            {message.authorUsername}{' '}
            {message.created.toString()}
        </div>
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
                        authorUsername: "user"
                    })
                }}/>
                <p>Server messages:</p>
                    {allMessages}
                <br/>
                <br/>
                <button className={"confirm-button"} onClick={() => sendMessage()}>Send</button>
                <Messages/>
                <button onClick={() => joinRoom("user", roomId)}>join room</button>
                <br/>
                <br/>
            </>
        )
    }
}

export default Chat
