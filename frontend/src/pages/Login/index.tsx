import React, {useState, useEffect, useRef} from "react"
import {useLoginUserMutation} from "../../services/authApi"
import {useAppDispatch} from "../../app/hooks"
import {setUser} from "../../features/authSlice"

const Login = () => {
    const [username, setUsername] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    const [repeatPassword, setRepeatPassword] = useState<string | null>(null)
    const dispatch = useAppDispatch()

    const [
        loginUser,
        {
            data: loginData,
            isSuccess: isLoginSuccess,
            isError: isLoginError,
            error: loginError,
        }
    ] = useLoginUserMutation()

    const login = async () => {
        if (username !== null && password !== null) {
            await loginUser({username, password})
        }
    }

    useEffect(() => {
        if (isLoginSuccess) {
            dispatch(setUser(loginData))
        }
    }, [dispatch, loginData, isLoginSuccess])

    return (
        <>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" onChange={(e) => {
                setUsername(() => e.target.value)
            }}/>

            <label htmlFor="password">Password</label>
            <input type="password" id="password" onChange={(e) => {
                setPassword(() => e.target.value)
            }}/>

            <button onClick={login}>login</button>
        </>
    )
}

export default Login