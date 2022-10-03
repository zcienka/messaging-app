import React, {useState, useEffect, useRef} from "react"
import {useCreateRoomMutation, useGetRoomQuery} from "../../services/roomApi"
import {JwtToken} from "../../utils/JwtToken"
import Messages from "../Messages";

const JoinRoom = () => {
    const [users, setUsers] = useState<string[]>(["user"])
    const [jwtToken, setJwtToken] = useState<JwtToken>(JSON.parse(localStorage.getItem("user") || "{}"))

    const [createRoom, {
        data: createRoomData,
        isSuccess: isCreateRoomSuccess,
        isError: isCreateRoomError,
        error: createRoomError,
    }] = useCreateRoomMutation()

    const createChatRoom = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        const token = jwtToken.token
        await createRoom({users, token})
    }

    return (
        <div>
            <button className={"confirm-button"} onClick={(e) => createChatRoom(e)}>Join room</button>
            <p>Messages:</p>
            {createRoomData !== undefined ? <Messages id={"a89b7cb2b51d4adb9beea6cfd6d24676"}/> : null}
        </div>
    )
}

export default JoinRoom