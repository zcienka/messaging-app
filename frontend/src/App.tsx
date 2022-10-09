import React, {useEffect} from "react"
import JoinRoom from "./pages/JoinRoom"
import Login from "./pages/Login"
import {Route, BrowserRouter, Routes} from "react-router-dom"
import Messages from "./pages/Messages"
import Chat from "./pages/Chat"

function App() {

  return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
            <Route path={"/"} element={<JoinRoom/>}/>
            <Route path={"/login"} element={<Login/>}/>
            <Route path={"/messages/:id"} element={<Messages/>}/>
            <Route path={"/chat"} element={<Chat/>}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
