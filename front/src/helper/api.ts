
const api = {
    auth: async (port: number, method: 'POST' | 'GET' | 'PATCH', action: string, body: object, params:string = "") => {
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
    },
    openData: async (limit = 100, offset = 0) => {
        const response = await fetch(`https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/velib-disponibilite-en-temps-reel/records?limit=${limit}&offset=${offset}`, {
            method: "GET"
        });
        const responseJson = await response.json();
        if (response.status === 200 || response.status === 201) {
            return responseJson;
        }
        else {
            throw new Error(responseJson.message);
        }
    }
}
export default api;
