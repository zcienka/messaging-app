import React, {useState, useEffect, useRef} from "react"
import {useGetRoomQuery} from "../../services/roomApi"
import Message from "../../utils/Message";
import {JwtToken} from "../../utils/JwtToken";

interface IProps {
    id: string
}

const Messages = ({id}: IProps) => {
    const [jwtToken, setJwtToken] = useState<JwtToken>(JSON.parse(localStorage.getItem("user") || "{}"))
    const [messages, setMessages] = useState<any>(null)

    const {
        data: getRoomData,
        isFetching: isGetRoomFetching,
        isSuccess: isGetRoomSuccess
    } = useGetRoomQuery({roomId: id, token: jwtToken.token})

    useEffect(() => {

        if (isGetRoomSuccess) {
            const mappedMessages = getRoomData.messages.results.map((message: Message) => {
                return <div key={message.id}>
                    <div>{message.text}</div>
                    <div>username: {message.authorUsername}</div>
                </div>
            })

            setMessages(mappedMessages)
        }
    }, [getRoomData, isGetRoomSuccess])

    return (
        <>
            {messages}
        </>
    )
}

export default Messages
