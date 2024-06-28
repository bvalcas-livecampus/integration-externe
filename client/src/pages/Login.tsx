import Input from "../components/Form/Input.tsx";
import {useEffect, useState} from "react";
import Error from "../components/Form/Error.tsx";
import api from "../helper/api.ts";
import {useNavigate} from "react-router-dom";
import Spinner from "../components/Spinner.tsx";
import {handleIdentifier, handlePassword} from "../helper/customer.ts";

const Login = () => {
    const [identifier, setIdentifier] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [isRegistration, setIsRegistration] = useState(true);
    const [error, setError] = useState<{ identifier: string | null, password: string | null, global: string | null }>({
        identifier: null,
        password: null,
        global: null
    })
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = () => {
        if (identifier === null || password === null) {
            setError({
                ...error,
                global: "Vous devez compléter tous les champs"
            });
            return;
        } else if (error.password !== null || error.identifier !== null) {
            setError({
                ...error,
                global: "Vous devez d'abord corriger les erreurs avant de soumettre le formulaire"
            });
            return;
        }
        // On fait une requête sur le serveur d'authentification
        setIsLoading(true);
        const data = {
            identifiant: identifier,
            motdepasse: password
        };
        const apiCall = isRegistration ? api( "POST","register", data) : api("POST","login", data);

        apiCall
            .then((jeton: string) => {
                localStorage.setItem("jeton", jeton);
                navigate("/");
            })
            .catch((e) => {
                setError({
                    ...error,
                    global: e.message || "Une erreur s'est produite"
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        // On vérifie si un utilisateur est déjà connecté
        if (token) {
            api( "POST", "verify", {jeton: token})
                .then(() => {
                    // L'utilisateur est connecté, on le redirige vers la page d'accueil
                    navigate("/");
                })
                .catch(error => {
                    // Le token ne correspond pas à un utilisateur connecté ou une erreur est survenue
                    console.error(error);
                })
        }
    }, []);

    const handleIdentifierWrapper = (newIdentifier: string) => handleIdentifier(newIdentifier, setError, setIdentifier, error);
    const handlePasswordWrapper = (newPassword: string) => handlePassword(newPassword, setError, setPassword, error);

    return (
        <div className="flex items-center justify-center">
            <div className="relative flex flex-col rounded-xl bg-transparent bg-clip-border text-gray-700 shadow-none">
                <h4 className="block font-sans text-2xl font-semibold leading-snug tracking-normal text-blue-gray-900 antialiased">
                    {isRegistration ? "Inscrivez-vous" : "Connectez-vous"}
                </h4>
                <p className="mt-1 block font-sans text-base font-normal leading-relaxed text-gray-700 antialiased">
                    {isRegistration ? "Entrez vos informations pour vous inscrire" : "Entrez vos informations pour vous connecter"}
                </p>
                <form className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
                    <div className="mb-4 flex flex-col gap-6">
                        <Input type={"text"} name={"Identifiant"} errorMessage={error.identifier} handle={handleIdentifierWrapper}/>
                        <Input type={"password"} name={"Mot de passe"} errorMessage={error.password}
                               handle={handlePasswordWrapper}/>
                        <Error errorMessage={error.global}/>
                    </div>
                    {isLoading && <Spinner/>}
                    <button
                        className="mt-6 block w-full select-none rounded-lg bg-pink-500 py-3 px-6 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        type="button"
                        data-ripple-light="true"
                        onClick={onSubmit}
                    >
                        {isRegistration ? "Inscription" : "Connexion"}
                    </button>
                    <p className="mt-4 block text-center font-sans text-base font-normal leading-relaxed text-gray-700 antialiased">
                        {isRegistration ? "Vous avez déjà un compte ?" : "Vous n'avez pas de compte ?"}
                        <button
                            className="font-semibold text-pink-500 transition-colors hover:text-blue-700"
                            type="button"
                            onClick={() => {
                                setIsRegistration(!isRegistration);
                            }}
                            disabled={isLoading}
                        >
                            {isRegistration ? "Connectez-vous" : "Inscrivez-vous"}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    )

}

export default Login