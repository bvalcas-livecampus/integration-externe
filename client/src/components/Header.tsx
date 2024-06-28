import {Link, useNavigate} from "react-router-dom";
import {useContext, useEffect} from "react";
import {AuthContext} from "../context/AuthContext.tsx";
import api from "../helper/api.ts";

const Header = () => {
    const {isConnected, identifier, login, logout} = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            api("POST", "verify")
                .then((response) => {
                    login(response.utilisateur.identifiant)
                })
                .catch(error => {
                    // Le token ne correspond pas à un utilisateur connecté ou une erreur est survenue
                    logout()
                    localStorage.removeItem('token')
                    console.error(error);
                })
        } else {
            logout()
        }
    }, [isConnected, navigate, login, logout]);

    return (
        <header>
            <nav className="bg-white border-gray-200 px-4 py-2.5 dark:bg-gray-800">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <Link to={"/itineraries"}>
                        <img src="../../public/img/logo.png" className="mr-3 h-6 sm:h-9"
                             alt="Projet Logo"/>
                        <span
                            className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Vélibs</span>
                    </Link>
                    <div className="flex items-center lg:order-2">
                        {!isConnected &&
                            <Link to={"/"}
                                  className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                <p>Connexion</p>
                            </Link>}
                        {identifier &&
                            <p className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">Bonjour {identifier}</p>
                        }
                        {isConnected &&
                            <>
                                <Link to={"/itineraries"}
                                      className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                    <p>Voir les stations disponibles</p>
                                </Link>
                                <Link to={"/create-itinerary"}
                                      className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                    <p>Créer un itinéraire</p>
                                </Link>
                                <Link to={"/dashboard-itineraries"}
                                      className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                    <p>Consultez la liste de vos itinéraires</p>
                                </Link>
                                <Link to={"/account"}
                                      className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                    <p>Compte</p>
                                </Link>
                                <Link to={"/logout"}
                                      className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xs px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">
                                    <p>Déconnexion</p>
                                </Link>
                            </>
                        }
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Header