import React, {useState} from "react"
import {ReactComponent as BurgerNav} from "../imgs/burgerNavIcon.svg"

const Navbar = () => {
    const [showNavbar, setShowNavbar] = useState(false)

    return <div>
        <div className={"h-16 bg-white"}>
            <div className={"flex justify-end h-full p-2"}>
                <div className={`flex items-center w-16 p-2 cursor-pointer`}>
                    <BurgerNav className={""} onClick={() => setShowNavbar(!showNavbar)}/>
                </div>
            </div>
        </div>
        <div className={`${showNavbar ? "flex" : "hidden"}`}>
            <Dropdown/>
        </div>
    </div>
}

const Dropdown = () => {
    return <div className={"right-0 absolute rounded-b-xl"}>
        <aside className="w-64" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-white rounded-b-xl">
                <ul className="space-y-2">
                    <li>
                        <div className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100">
                            <span className="ml-3">Log out</span>
                        </div>
                    </li>
                    <li>
                        <div className="flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100">
                            <span className="ml-3">Delete the account</span>
                        </div>
                    </li>
                </ul>
            </div>
        </aside>
    </div>
}

export default Navbar
