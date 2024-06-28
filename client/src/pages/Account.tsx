import {useEffect, useRef, useState} from "react";
import Input from "../components/Form/Input.tsx";
import {handleIdentifier, handlePassword} from "../helper/customer.ts";
import api from "../helper/api.ts";
import {useNavigate} from "react-router-dom";
import Error from "../components/Form/Error.tsx";
import Spinner from "../components/Spinner.tsx";
import {toast} from "react-toastify";
import logout from "./Logout.tsx";

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
        } else if (fieldName === "password" && lastPassword === null || lastPassword?.trim().length === 0) {
            setError({
                ...error,
                global: "Vous devez entrer votre ancien mot de passe avant de changer votre mot de passe"
            });
            return;
        }

        const fieldNameBody = fieldName === "identifier" ? "identifiant" : "motdepasse";
        const body = {
            [fieldNameBody]: value
        };

        const update = () => {
            api( "PATCH", "update", body, `?id=${localStorage.getItem("identifier")}`)
                .then((response) => {
                    toast.success(response.message, {
                        position: "bottom-center"
                    });
                    if (fieldName === "identifier") {
                        localStorage.setItem("identifier", value);
                    }
                    successCallback();
                    window.location.reload();
                })
                .catch(e => {
                    toast.error(e.message || "Une erreur s'est produite", {
                        position: "bottom-center"
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

        setIsLoading(true);
        if (fieldName === "password") {
            // On test d'abord l'ancien mot de passe avant de pouvoir le changer
            api("POST", "login", {identifiant: localStorage.getItem('identifier'), motdepasse: lastPassword})
                .then(() => {
                    // On modifie le mot de passe
                    update();
                })
                .catch(() => {
                    setIsLoading(false);
                    setError({
                        ...error,
                        global: "L'ancien mot de passe est incorrect"
                    });
                })
        } else
            // On modifie l'identifiant
            update();
    }

    const onSubmitIdentifier = () => {
        onSubmitField('identifier', identifier, () => {
            setChangeIdentifier(false);
        });
    }

    const onSubmitPassword = () => {
        onSubmitField('password', password, () => {
            setChangePassword(false);
        });
    }

    if (isLoading && !localStorage.getItem("token")) {
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
                <button type="button" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm mt-2" onClick={onSubmitIdentifier} disabled={isLoading}>Changer votre identifiant</button>
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