import React, {useEffect} from "react"
import Login from "./pages/Login"
import {Route, BrowserRouter, Routes} from "react-router-dom"
import Chat from "./pages/Chat"

function App() {

    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
                <Route path={"/login"} element={<Login/>}/>
                <Route path={"/chat/:id"} element={<Chat/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
