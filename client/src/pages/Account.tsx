import {useEffect, useRef, useState} from "react";
import Input from "../components/Form/Input.tsx";
import {handleIdentifier, handlePassword} from "../helper/customer.ts";
import api from "../helper/api.ts";
import {useNavigate} from "react-router-dom";
import Error from "../components/Form/Error.tsx";
import Spinner from "../components/Spinner.tsx";

const Account = () => {
    const [changeIdentifier, setChangeIdentifier] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [identifier, setIdentifier] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [lastPassword, setLastPassword] = useState<string | null>(null);
    const [error, setError] = useState<{ identifier: string | null, password: string | null, global: string | null }>({
        identifier: null,
        password: null,
        global: null
    })
    const [isLoading, setIsLoading] = useState(false);
    const customer = useRef<{id: number, identifier: string}>({
        id: 0,
        identifier: ""
    });
    const navigate = useNavigate();
    let title = "Changer vos informations"

    if (changeIdentifier) {
        title = "Changer votre identifiant"
    } else if (changePassword) {
        title = "Changer votre mot de passe"
    }

    const handleIdentifierWrapper = (newIdentifier: string) => handleIdentifier(newIdentifier, setError, setIdentifier, error);
    const handlePasswordWrapper = (newPassword: string) => handlePassword(newPassword, setError, setPassword, error);
    const handleLastPassword = (password: string) => {
        setLastPassword(password);
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        // On vérifie si un utilisateur est déjà connecté
        if (token) {
            setIsLoading(true)
            api.auth(3001, "POST", "verify", {jeton: token})
                .then(response => {
                    // L'utilisateur est connecté, on récupère l'id de l'utilisateur
                    if (response.id) {
                        customer.current = {
                            id: response.id,
                            identifier: response.identifiant
                        }
                    }
                })
                .catch(error => {
                    // Le token ne correspond pas à un utilisateur connecté ou une erreur est survenue
                    navigate("/");
                    console.error(error);
                })
                .finally(() => {
                    setIsLoading(false)
                });
        } else {
            //navigate("/");
        }
    }, []);

    const onSubmitField = (fieldName: "identifier" | "password", value, successCallback) => {
        if (!value) {
            setError({
                ...error,
                global: "Vous devez compléter tous les champs"
            });
            return;
        } else if (error[fieldName] !== null) {
            setError({
                ...error,
                global: "Vous devez d'abord corriger les erreurs avant de soumettre le formulaire"
            });
            return;
        } else if (fieldName === "password" && lastPassword === null || lastPassword.trim().length === 0) {
            setError({
                ...error,
                global: "Vous devez entrer votre ancien mot de passe avant de changer votre mot de passe"
            });
            return;
        }

        const fieldNameBody = fieldName === "email" ? "identifiant" : "motdepasse";
        const body = {
            [fieldNameBody]: value
        };

        setIsLoading(true);
        // On test d'abord l'ancien mot de passe avant de pouvoir le changer
        api.auth(3001, "POST", "login", {identifiant: customer.current.identifier, motdepasse: lastPassword})
            .then(() => {
                // On modifie le mot de passe
                api.auth(3001, "PATCH", "update", body, `?id=${customer.current.id}`)
                    .then(response => {
                        successCallback();
                    })
                    .catch(e => {
                        setError({
                            ...error,
                            global: e.message || "Une erreur s'est produite"
                        });
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            })
            .catch(e => {
                setIsLoading(false);
                setError({
                    ...error,
                    global: "L'ancien mot de passe est incorrect"
                });
            })

    }

    const onSubmitEmail = () => {
        onSubmitField('identifier', identifier, () => {
            setChangeIdentifier(false);
        });
    }

    const onSubmitPassword = () => {
        onSubmitField('password', password, () => {
            setChangePassword(false);
        });
    }

    if (isLoading && customer.current.id === 0) {
        return <Spinner/>
    }

    return (
        <div className="max-w-lg mx-auto  bg-white dark:bg-gray-800 rounded-lg shadow-md px-8 py-10 flex flex-col items-center">
            <h1 className="text-xl font-bold text-center text-gray-700 dark:text-gray-200 mb-8">
                {title}
            </h1>
            {(!changeIdentifier && !changePassword) && <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm mb-4 w-full" onClick={() => setChangeIdentifier(true)}>Changer votre identifiant</button>}
            {(!changeIdentifier && !changePassword) && <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm w-full" onClick={() => setChangePassword(true)}>Changer votre mot de passe</button>}
            {changeIdentifier && <form action="#" className="w-full flex flex-col gap-4">
                <Input type={"text"} name={"Identifiant"} errorMessage={error.identifier} handle={handleIdentifierWrapper}/>
                <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm mt-2" onClick={onSubmitEmail} disabled={isLoading}>Changer votre identifiant</button>
                {isLoading && <Spinner/>}
                <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm" onClick={() => setChangeIdentifier(false)}>Annuler</button>
            </form>}
            {changePassword && <form action="#" className="w-full flex flex-col gap-4">
                <Input type={"password"} name={"Ancien mot de passe"} handle={handleLastPassword}/>
                <Input type={"password"} name={"Mot de passe"} errorMessage={error.password} handle={handlePasswordWrapper}/>
                <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm mt-2" onClick={onSubmitPassword} disabled={isLoading}>Changer votre mot de passe</button>
                {isLoading && <Spinner/>}
                <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm" onClick={() => setChangePassword(false)}>Annuler</button>
            </form>}
            <Error errorMessage={error.global}/>
        </div>
    )
};

export default Account;