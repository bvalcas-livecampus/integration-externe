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

export const handleIdentifier = (
    newIdentifier: string,
    setError: React.Dispatch<React.SetStateAction<{
        identifier: string | null,
        password: string | null,
        global: string | null
    }>>,
    setIdentifier: React.Dispatch<React.SetStateAction<string>>,
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

export const handlePassword = (
    newPassword: string,
    setError: React.Dispatch<React.SetStateAction<{
        identifier: string | null,
        password: string | null,
        global: string | null
    }>>,
    setPassword: React.Dispatch<React.SetStateAction<string>>,
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