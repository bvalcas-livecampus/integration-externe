export type Itinerary = {
    identifier: string;
    name: string;
    steps: Step[];
    pdf?: string;
    status?: string;
    message?: string;
}

export type Step = {
    lon: number;
    lat: number;
}

export type Itineraries = Itinerary[];