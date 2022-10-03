import React, {useState, useEffect, useRef} from "react"
import {HubConnection} from "@microsoft/signalr"
import Messages from "../Messages";

const Chat = () => {
    const [message, setMessage] = useState<string>()
    const [connection, setConnection] = useState<HubConnection | null>(null)
    const [chat, setChat] = useState<any>([])
    const latestChat = useRef<any>(null)

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    connection.on("ReceiveMessage", message => {
                        const updatedChat = [...latestChat.current]
                        updatedChat.push(message)
                        setChat(updatedChat)
                    })
                })
                .catch(e => console.log("Connection failed: ", e))
        }
    }, [connection])

    const sendMessage = async () => {
        if (connection !== null) {
            if (connection.connectionId) {
                try {
                    await connection.send("SendMessage", message)
                } catch (e) {
                    console.log(e)
                }
            } else {
                alert("No connection to server yet.")
            }
        }
    }

    const messages = chat.map((message: string) => {
        return <div>{message}</div>
    })

    return (
        <>
            <br/>
            <br/>
            <p>Message</p>
            <input onChange={(e) => {
                setMessage(() => {
                    return e.target.value
                })
            }}/>
            <p>Server messages:</p>
            {messages}

            <br/>
            <br/>
            <button className={"confirm-button"} onClick={(e) => sendMessage()}>Send</button>
            <Messages id={"9f71466ec94a432581a0f50ea796c885"}/>
            <br/>
            <br/>
        </>
    )
}

export default Chat