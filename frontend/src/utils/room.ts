import Message from "./Message";

export type Room = {
    id: string,
    usernames: string[],
    lastMessage: string,
    messages: AllMessages
}

export type AllMessages = {
    count: number,
    next: string | null,
    previous: string | null,
    results: Message[],
}

export type RoomRequest = {
    roomId: string,
    token: string,
    url: string,
}

export type CreateRoomRequest = {
    token: string,
    users: string[],
}

