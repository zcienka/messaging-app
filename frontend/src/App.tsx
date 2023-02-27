import React from "react"
import LoginRegister from "./pages/LoginRegister"
import {Route, BrowserRouter, Routes} from "react-router-dom"
import ChatRooms from "./pages/ChatRooms";

function App() {
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
                <Route path={"/"} element={<ChatRooms/>}/>
                <Route path={"/login"} element={<LoginRegister/>}/>
                <Route path={"/register"} element={<LoginRegister/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
