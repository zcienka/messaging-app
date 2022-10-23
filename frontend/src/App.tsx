import React from "react"
import LoginRegister from "./pages/LoginRegister"
import {Route, BrowserRouter, Routes} from "react-router-dom"
import Chat from "./pages/Chat"
import Navbar from "./components/Navbar"

function App() {

    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
                <Route path={"/login"} element={<LoginRegister/>}/>
                <Route path={"/register"} element={<LoginRegister/>}/>
                <Route path={"/chat/:id"} element={<Chat/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
