import React, {useState, useEffect} from "react"
import {useLoginUserMutation, useRegisterUserMutation} from "../../services/userApi"
import {useAppDispatch} from "../../app/hooks"
import {setUser} from "../../features/authSlice"
import {ReactComponent as ErrorIcon} from "../../imgs/errorIcon.svg"
import {Tooltip} from "flowbite-react"
import {Link, useNavigate} from "react-router-dom"
import {Error} from "../../utils/ErrorMessage"

const LoginRegister = () => {
    return (
        <>
            <div className={"flex h-screen w-screen bg-gray-50"}>
                {window.location.pathname === "/login" ? <Login/> : <Register/>}
            </div>
        </>
    )
}

const Login = () => {
    const [username, setUsername] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [
        loginUser,
        {
            data: loginData,
            isSuccess: isLoginSuccess,
            isError: isLoginError,
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
            navigate('/', {replace: true})
        }
    }, [navigate, dispatch, loginData, isLoginSuccess])

    return (
        <div className={"h-full w-full"}>
            <div className={"mt-16 flex md:justify-center items-center flex-col md:h-full md:mt-0 md:px-0 px-6"}>
                <h1 className={"text-4xl text-center md:text-5xl font-bold mb-3"}>Log in</h1>
                <p className={"text-xl text-center mb-8 md:text-xl md:mb-6 text-gray-500"}>
                    Please enter your username and password to log in
                </p>

                <div
                    className={"border-slate-200 flex bg-white w-full h-96 md:w-128 flex-col border rounded-3xl px-8 md:px-12 py-12 text-neutral-800 border"}>
                    <label className={"mb-2"} htmlFor="username">Username</label>

                    <div className={"flex justify-end items-center relative"}>
                        <input
                            className={`${!isLoginError ? "border-slate-200" : 'border-red-600'} w-full mb-8 pr-8`}
                            type="text" id="username" onChange={(e) => {
                            setUsername(() => e.target.value)
                        }}/>
                        <div className={`${isLoginError ? "visible" : "invisible"} 
                            absolute w-8 h-8 text-red-600 top-2`}>
                            <Tooltip
                                content="Invalid username or password"
                                trigger="hover"
                                id="tooltip-top"
                            >
                                <ErrorIcon/>
                            </Tooltip>
                        </div>
                    </div>

                    <label className={"mb-2"} htmlFor="password">Password</label>
                    <input
                        className={"mb-2 pr-8"}
                        type="password" id="password"
                        onChange={(e) => {
                            setPassword(() => e.target.value)
                        }}/>

                    <div className={"flex h-full"}>
                        <div className={"flex items-end w-full"}>
                            <button className={"w-full"} onClick={login}>Login</button>
                        </div>
                    </div>
                    <p className={"pt-2 text-slate-600 text-sm"}>
                        Don't have an account? <span className={"text-violet-700"}><Link to={"/register"}>Register.</Link></span>
                    </p>
                </div>
            </div>
        </div>
    )
}

const Register = () => {
    const [error, setError] = useState<Error | null>(null)
    const [username, setUsername] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    const [repeatPassword, setRepeatPassword] = useState<string | null>(null)
    const [checkPasswords, setCheckPasswords] = useState(false)

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [
        registerUser,
        {
            data: registerData,
            isSuccess: isRegisterSuccess,
            isError: isRegisterError,
            error: registerError,
        }
    ] = useRegisterUserMutation()

    const register = async () => {
        if (username !== null && password !== null && repeatPassword === password) {
            await registerUser({username, password})
        }
    }

    useEffect(() => {
        if (isRegisterSuccess) {
            dispatch(setUser(registerData))
            navigate("/", {replace: true})
        }
    }, [dispatch, navigate, registerData, isRegisterSuccess])

    useEffect(() => {
        // @ts-ignore
        setError(registerError)
    }, [registerError])

    return (
        <div className={"h-full w-full"}>
            <div className={"mt-16 flex md:justify-center items-center flex-col md:h-full md:mt-0 md:px-0 px-6"}>
                <h1 className={"text-4xl text-center md:text-5xl font-bold mb-3"}>Create account</h1>
                <p className={"text-xl text-center mb-8 md:text-xl md:mb-6 text-gray-500"}>
                    Get started with your free account
                </p>

                <div
                    className={"border-slate-200 flex bg-white w-full h-96 md:w-128 flex-col border rounded-3xl px-8 md:px-12 py-8 text-neutral-800 border"}>
                    <label className={"mb-2"} htmlFor="username">Username</label>

                    <div className={"flex justify-end items-center relative"}>
                        <input
                            className={`${error?.originalStatus === 409 ? 'border-red-600' : "border-slate-200"} w-full mb-2 pr-8`}
                            type="text" id="username" onChange={(e) => {
                            setUsername(() => e.target.value)
                        }}/>
                        <div className={`${isRegisterError ? "visible" : "invisible"} 
                            absolute w-8 h-8 text-red-600`}>
                            <Tooltip
                                content="Username already exist"
                                trigger="hover"
                                id="tooltip-top"
                            >
                                <ErrorIcon/>
                            </Tooltip>
                        </div>
                    </div>
                    <label className={"mb-2"} htmlFor="password">Password</label>
                    <input
                        className={"mb-2 pr-8"}
                        type="password" id="password"
                        onChange={(e) => {
                            setPassword(() => e.target.value)
                        }}/>

                    <label className={"mb-2"} htmlFor="repeat-password">Repeat password</label>
                    <div className={"flex justify-end items-center relative"}>
                        <input
                            className={`${repeatPassword !== password && checkPasswords ? "border-red-600" : "border-slate-200"} w-full mb-2 pr-8`}
                            type="password" id="repeat-password" onChange={(e) => {
                            setRepeatPassword(() => e.target.value)
                        }} onBlur={() => setCheckPasswords(() => true)}/>
                        <div
                            className={`${repeatPassword !== password && checkPasswords ? "visible" : "invisible"} 
                                    absolute w-8 h-8 text-red-600`}>
                            <Tooltip
                                content="Passwords are not the same"
                                trigger="hover"
                            >
                                <ErrorIcon/>
                            </Tooltip>
                        </div>
                    </div>

                    <div className={"flex h-full"}>
                        <div className={"flex items-end w-full"}>
                            <button className={"w-full"} onClick={register}>Register </button>
                        </div>
                    </div>
                    <div className={" flex justify-end w-full"}>
                        <p className={"pt-2 text-slate-600 text-sm"}>
                            Already have an account? <span className={"text-violet-700"}><Link to={"/login"}>Log in.</Link></span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginRegister