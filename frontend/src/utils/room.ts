import {ApiList} from "../models/ApiList"
import Message from "./Message"

export interface Room {
    id: string,
    usernames: string[],
    messages: ApiList<Message>
}
