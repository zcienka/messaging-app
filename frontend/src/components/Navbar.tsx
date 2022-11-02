import React, {useEffect, useState} from "react"
import {ReactComponent as BurgerNav} from "../imgs/burgerNavIcon.svg"
import {logout} from "../features/authSlice"
import {useAppDispatch} from "../app/hooks"
import {useDeleteAccountMutation} from "../services/userApi"
import {DecodedToken, JwtToken} from "../utils/JwtToken"
import jwtDecode from "jwt-decode";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false)
    const [user, setUser] = useState<string | null>(null)
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem("user") || "{}")

    useEffect(() => {
        if (localStorage.getItem("user") !== null && jwtToken.token !== null) {
            const accessToken: DecodedToken = jwtDecode(jwtToken.token)
            setUser(accessToken.username)
        }
    }, [jwtToken.token])

    return <div>
        <div className={"h-16 bg-white border-b-2 border-gray-100"}>
            <div className={"flex justify-end h-full p-2"}>
                <div className={"flex items-center w-16 p-2 cursor-pointer"}>
                    {user !== null ? <BurgerNav className={""} onClick={() => setShowDropdown(!showDropdown)}/> : null}
                </div>
            </div>
        </div>
        <div className={`${showDropdown ? "flex" : "hidden"}`}>
            <Dropdown user={user} accessToken={jwtToken.token}/>
        </div>
    </div>
}

interface DropdownProps {
    user: string | null,
    accessToken: string | null,
}

const Dropdown = (props: DropdownProps) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [
        deleteAccount,
        {
            isSuccess: isDeleteAccountSuccess,
            isError: isDeleteAccountError,
        }
    ] = useDeleteAccountMutation()

    const deleteUser = () => {
        deleteAccount({username: props.user, token: props.accessToken})
    }

    useEffect(() => {
        if (isDeleteAccountSuccess) {
            dispatch(logout())
            navigate("/login")
        }
    }, [navigate, dispatch, isDeleteAccountSuccess])

    return <div className={"right-0 absolute rounded-b-xl border-x-2 border-b-2 border-gray-100"}>
        <aside className="w-64" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-white rounded-b-xl">
                <ul className="space-y-2">
                    <li>
                        <div
                            className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => {dispatch(logout()); navigate("/login")}}>
                            <span className="ml-3">Log out</span>
                        </div>
                    </li>
                    <li>
                        <div
                            className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 cursor-pointer"
                            onClick={() => deleteUser()}>
                            <span className="ml-3">Delete the account</span>
                        </div>
                    </li>
                </ul>
            </div>
        </aside>
    </div>
}

export default Navbar
