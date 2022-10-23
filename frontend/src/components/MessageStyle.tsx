import React from "react"
import Message from "../utils/Message"
import moment from "moment/moment"

interface Props {
    message: Message,
    user: string,
}

const MessageStyle = (props: Props) => {

    if (props.user === props.message.authorUsername)
        return <div className={"flex justify-end"}>
            <div className={"bg-violet-600 p-6 max-w-sm min-w-16 single-message-current-user mb-2 text-gray-100"}>
                {props.message.text}{' '}
                {props.message.authorUsername}{' '}
                {moment(props.message.created).fromNow()}
            </div>
        </div>
    else
        return <div className={"flex"}>
            <div className={"bg-gray-300 p-6 max-w-sm min-w-16 single-message mb-2"}>
                {props.message.text}{' '}
                {props.message.authorUsername}{' '}
                {moment(props.message.created).fromNow()}
            </div>
        </div>

}

export default MessageStyle
