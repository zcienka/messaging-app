import React, {useState, useRef} from "react"
import {HubConnection} from "@microsoft/signalr"
import Messages from "../Messages"
import {HubConnectionBuilder, HttpTransportType} from "@microsoft/signalr"
import {Message, MessageRequest} from "../../utils/Message"
import {JwtToken} from "../../utils/JwtToken";

const Chat = () => {
    const [message, setMessage] = useState<MessageRequest>()
    const [users, setUsers] = useState<string[]>()
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [chat, setChat] = useState<any>([])
    const latestChat = useRef<any>(null)
    const [jwtToken, setJwtToken] = useState<JwtToken>(JSON.parse(localStorage.getItem("user") || "{}"))

    const joinRoom = async (user: string, room: string) => {
        try {
            const connection = new HubConnectionBuilder()
                .withUrl("https://localhost:50133/chat", {
                    skipNegotiation: true,
                    transport: HttpTransportType.WebSockets
                })
                .build()

            connection.on("ReceiveMessage", (message) => {
                setChat((chatMessages: any) => [...chatMessages, message])
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
                await connection.send("SendMessage", message)
            } catch (e) {
                console.log(e)
            }
        } else {
            alert("No connection to server yet.")
        }
    }

    const messages = chat.map((message: Message) => {
        return <div key={message.id}>
            <div>{message.text}</div>
            <div>{message.authorUsername}</div>
        </div>
    })

    return (
        <>
            <br/>
            <br/>
            <p>Message</p>
            <input onChange={(e) => {
                setMessage({
                    text: e.target.value,
                    roomId: "a89b7cb2b51d4adb9beea6cfd6d24676",
                    authorUsername: "user"
                })
            }}/>
            <p>Server messages:</p>
            {messages}

            <br/>
            <br/>
            <button className={"confirm-button"} onClick={() => sendMessage()}>Send</button>
            <Messages/>
            <button onClick={() => joinRoom("user", "a89b7cb2b51d4adb9beea6cfd6d24676")}>join room</button>
            <br/>
            <br/>
        </>
    )
}

export default Chat
