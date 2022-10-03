import React, {useEffect} from "react"
import JoinRoom from "./pages/JoinRoom"
import Login from "./pages/Login"
import {Route, BrowserRouter, Routes} from "react-router-dom"

function App() {

  return (
      <BrowserRouter basename={process.env.PUBLIC_URL}>
        <Routes>
            <Route path={"/"} element={<JoinRoom/>}/>
            <Route path={"/login"} element={<Login/>}/>
        </Routes>
      </BrowserRouter>
  )
}

export default App
