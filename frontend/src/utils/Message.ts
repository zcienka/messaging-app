export type Message = {
    id: string,
    text: string,
    roomId: string,
    authorUsername: string,
    created: string,
}

export interface MessageRequest {
    text: string,
    roomId: string,
    authorUsername: string | undefined,
}

export default Message
