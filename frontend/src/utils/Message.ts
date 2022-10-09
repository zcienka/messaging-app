export interface Message {
    id: string,
    text: string,
    roomId: string,
    authorUsername: string,
}

export interface MessageRequest {
    text: string,
    roomId: string,
    authorUsername: string,
}

export default Message
