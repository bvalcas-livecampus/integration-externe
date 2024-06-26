import {useEffect} from "react";
import api from "../helper/api.ts";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        api.auth(3000, "POST","verify", {jeton: token})
            .then(response => {
                api.auth(3000, "GET","logout", {token})
                    .then(response => {
                        // On supprime le token du localStorage
                        localStorage.removeItem("token");
                        // On redirige l'utilisateur vers la page d'accueil
                        navigate("/");
                    })
                    .catch(error => {
                        // Une erreur est survenue
                        toast.error(error.message, {
                            position: "bottom-center"
                        });
                        // On redirige l'utilisateur vers la page d'accueil
                        navigate("/");
                    });
            })
            .catch(error => {
                // Le token ne correspond pas à un utilisateur connecté ou une erreur est survenue
                toast.error(error.message, {
                    position: "bottom-center"
                });
                // On redirige l'utilisateur vers la page d'accueil
                navigate("/");
            })
    }, []);

    return <></>
}

export default Logout