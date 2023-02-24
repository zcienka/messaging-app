import React from "react"
import Message from "../utils/Message"
import moment from "moment/moment"

interface Props {
    message: Message,
    user: string,
}

const SingleMessage = (props: Props) => {
    if (props.user === props.message.authorUsername)
        return <div className={"flex justify-end"}>
            <div className={"flex-col mb-2"}>
                <div className={"flex justify-end"}>
                    <div
                        className={"w-fit bg-violet-600 p-6 max-w-sm min-w-12 single-message-current-user text-gray-100"}>
                        {props.message.text}
                    </div>
                </div>
                <div className={"flex text-gray-600 justify-end"}>
                    {moment(props.message.created).fromNow()}
                </div>
            </div>
        </div>
    else
        return <div className={"flex"}>
            <div className={"flex-col mb-2"}>
                <div className={"w-fit bg-gray-300 p-6 max-w-sm min-w-12 single-message"}>
                    {props.message.text}{' '}
                </div>
                <div className={"flex text-gray-600"}>
                    {moment(props.message.created).fromNow()}
                </div>
            </div>
        </div>
}

export default SingleMessage
