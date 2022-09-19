import React, {useState, useEffect, useRef} from 'react';
import {HubConnectionBuilder} from '@microsoft/signalr';
import {HubConnection} from '@microsoft/signalr';

const Chat = () => {
    const [message, setMessage] = useState<string>();
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [chat, setChat] = useState<any>([]);
    const latestChat = useRef<any>(null);
    latestChat.current = chat;

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('https://localhost:50133/chatHub')
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(result => {
                    connection.on('ReceiveMessage', message => {
                        const updatedChat = [...latestChat.current];
                        updatedChat.push(message);
                        setChat(updatedChat);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    const sendMessage = async () => {
        // const chatMessage = {
        //     // user: "user",
        //     message: "message"
        // };

        if (connection !== null) {
            if (connection.connectionId) {
                try {
                    await connection.send('SendMessage', message);
                } catch (e) {
                    console.log(e);
                }
            } else {
                alert('No connection to server yet.');
            }
        }
    }
    const messages = chat.map((message: string) => {
        return <div>{message}</div>
    })
    return (
        <div>
            <br/>
            <br/>
            <input onChange={(e) => {
                setMessage(() => {
                    return e.target.value
                })
            }}/>
            <br/>
            <br/>
            <button className={'confirm-button'} onClick={(e) => sendMessage()}>Send</button>
            <br/>
            <br/>
            <p>Server messages:</p>
            {messages}
        </div>
    );
};

export default Chat;