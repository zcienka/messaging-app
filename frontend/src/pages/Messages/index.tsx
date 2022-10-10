import React, {useState, useEffect, useRef} from "react"
import {useGetRoomQuery} from "../../services/roomApi"
import Message from "../../utils/Message"
import {JwtToken} from "../../utils/JwtToken"
import {useParams} from "react-router-dom"

interface IProps {
    id: string
}

const Messages = () => {
    const [jwtToken, setJwtToken] = useState<JwtToken>(JSON.parse(localStorage.getItem("user") || "{}"))
    const [messages, setMessages] = useState<any>(null)

    return (
        <>
            {messages}
        </>
    )
}

export default Messages
