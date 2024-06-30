/**
 * Cette fonction permet de réinitialiser les erreurs d'un formulaire
 * @param properties - Les propriétés à réinitialiser {Array<'identifier' | 'password' | 'global'>}
 * @param setError - La fonction de modification des erreurs {React.Dispatch<React.SetStateAction<{
 * @param error - Les erreurs actuelles {object}
 */
export const resetError = (
    properties: Array<'identifier' | 'password' | 'global'>,
    setError: React.Dispatch<React.SetStateAction<{
        identifier: string | null,
        password: string | null,
        global: string | null
    }>>,
    error: { identifier: string | null, password: string | null, global: string | null }
) => {
    for (const property of properties) {
        if (property in error) {
            setError((prevError) => ({
                ...prevError,
                [property]: null
            }));
        }
    }
};

/**
 * Cette fonction permet de gérer l'identifiant d'un formulaire
 * @param newIdentifier - Le nouvel identifiant {string}
 * @param setError - La fonction de modification des erreurs {React.Dispatch<React.SetStateAction<{
 * @param setIdentifier - La fonction de modification de l'identifiant {React.Dispatch<React.SetStateAction<string | null>>}
 * @param error - Les erreurs actuelles {object}
 */
export const handleIdentifier = (
    newIdentifier: string,
    setError: React.Dispatch<React.SetStateAction<{
        identifier: string | null,
        password: string | null,
        global: string | null
    }>>,
    setIdentifier: React.Dispatch<React.SetStateAction<string | null>>,
    error: { identifier: string | null, password: string | null, global: string | null },
) => {
    if (newIdentifier.trim().length < 5) {
        setError(prevError => ({
            ...prevError,
            identifier: "L'identifiant doit contenir au moins 5 caractères",
            global: null
        }));
    } else {
        resetError(['identifier', 'global'], setError, error);
    }
    setIdentifier(newIdentifier);
}

/**
 * Cette fonction permet de gérer le mot de passe d'un formulaire
 * @param newPassword - Le nouveau mot de passe {string}
 * @param setError - La fonction de modification des erreurs {React.Dispatch<React.SetStateAction<{
 * @param setPassword - La fonction de modification du mot de passe {React.Dispatch<React.SetStateAction<string>>}
 * @param error - Les erreurs actuelles {object}
 */
export const handlePassword = (
    newPassword: string,
    setError: React.Dispatch<React.SetStateAction<{
        identifier: string | null,
        password: string | null,
        global: string | null
    }>>,
    setPassword: React.Dispatch<React.SetStateAction<string | null>>,
    error: { identifier: string | null, password: string | null, global: string | null },
) => {
    if (newPassword.trim().length < 8) {
        setError({
            ...error,
            password: "Le mot de passe doit contenir au moins 8 caractères",
            global: null
        });
    } else {
        resetError(['password', 'global'], setError, error);
    }
    setPassword(newPassword);
}