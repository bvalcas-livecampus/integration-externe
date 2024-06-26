import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import api from "../helper/api.ts";

const Header = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        // On vérifie si un utilisateur est déjà connecté
        if (token) {
            api(3000, "POST", "verify",  {jeton: token})
                .then(response => {
                    // L'utilisateur est connecté
                    setIsConnected(true);
                })
                .catch(error => {
                    // Le token ne correspond pas à un utilisateur connecté ou une erreur est survenue
                    console.error(error);
                })
        }
    }, []);

    return (
        <header>
            <nav className="bg-white border-gray-200 px-4 py-2.5 dark:bg-gray-800">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <Link to={"/"}>
                        <img src="../../public/img/logo.png" className="mr-3 h-6 sm:h-9"
                             alt="Projet Logo"/>
                        <span
                            className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Vélibs</span>
                    </Link>
                    <div className="flex items-center lg:order-2">
                        {!isConnected &&
                            <Link to={"/login"}
                                  className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                <p>Connexion</p>
                            </Link>}
                        {isConnected &&
                            <Link to={"/account"}
                                  className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                <p>Compte</p>
                            </Link>}
                        {isConnected &&
                            <Link to={"/logout"}
                                  className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                <p>Déconnexion</p>
                            </Link>}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header