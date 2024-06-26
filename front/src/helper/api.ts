const api = async (port: number, method: 'POST' | 'GET' | 'PATCH', action: string, body: object, params:string = "") => {
    const response = await fetch(`http://localhost:${port}/${action}${params}`, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    const responseJson = await response.json();
    if (response.status === 200 || response.status === 201) {
        return responseJson;
    }
    else {
        throw new Error(responseJson.message);
    }
};
export default api;
