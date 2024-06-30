import {Step} from "../type/type.ts";

export type Station = {
    stationcode: string;
    name: string;
    is_installed: 'OUI' | 'NON';
    capacity: number;
    numdocksavailable: number;
    numbikesavailable: number;
    mechanical: number;
    ebike: number;
    is_renting: 'OUI' | 'NON';
    is_returning: 'OUI' | 'NON';
    duedate: string;
    coordonnees_geo: {
        lon: number;
        lat: number;
    };
    nom_arrondissement_communes: string;
    code_insee_commune: string | null;
};

const map = {
    /**
     * Cette fonction permet d'obtenir le centre de la carte
     * @param stations {Station[]}- Les stations
     * @returns {[lat, lng]} - Les coordonnées du centre de la carte
     */
    getCenterStations: (stations: Station[]) => {
        if (stations.length === 0) {
            return [48.85, 2.26];
        }

        const validStations = stations.filter(station =>
            station.coordonnees_geo && station.coordonnees_geo.lat && station.coordonnees_geo.lon
        );

        const {countLat, countLng} = validStations.reduce((acc, station) => {
            acc.countLat += station.coordonnees_geo.lat;
            acc.countLng += station.coordonnees_geo.lon;
            return acc;
        }, {countLat: 0, countLng: 0});

        const lat = countLat / validStations.length;
        const lng = countLng / validStations.length;
        return [lat, lng];
    },

    /**
     * Cette fonction permet d'obtenir le centre de la carte à partir des étapes
     * @param steps {Step[]} - Les étapes
     */
    getCenterSteps: (steps: Step[]) => {
        const {countLat, countLng} = steps.reduce((acc, step) => {
            acc.countLat += step.lat;
            acc.countLng += step.lon;
            return acc;
        }, {countLat: 0, countLng: 0});

        const lat = countLat / steps.length;
        const lng = countLng / steps.length;
        return [lat, lng];
    },

    /**
     * Cette fonction permet de convertir des degrés en radians
     * @param deg {number} - Les degrés
     */
    deg2rad(deg: number) {
        return deg * (Math.PI / 180);
    },

    /**
     * Cette fonction permet de filtrer les stations à partir d'une position de départ
     * @param stations - Les stations {Station[]}
     * @param start - La position de départ {lat: number, lon: number}
     */
    filteredStations: (stations: Station[], start: {lat: number, lon: number}) => {
        const distance = 0.5;
        const markers = [];
        for (const station of stations) {
            if (station.coordonnees_geo) {
                const latFrom = map.deg2rad(station.coordonnees_geo.lat);
                const lonFrom = map.deg2rad(station.coordonnees_geo.lon);
                const latTo = map.deg2rad(start.lat);
                const lonTo = map.deg2rad(start.lon);
                const lonDelta = lonTo - lonFrom;
                const a = Math.pow(Math.cos(latTo) * Math.sin(lonDelta), 2) +
                    Math.pow(Math.cos(latFrom) * Math.sin(latTo) - Math.sin(latFrom) * Math.cos(latTo) * Math.cos(lonDelta), 2);
                const b = Math.sin(latFrom) * Math.sin(latTo) + Math.cos(latFrom) * Math.cos(latTo) * Math.cos(lonDelta);
                const angle = Math.atan2(Math.sqrt(a), b);
                const distanceVilles = angle * 6371;
                if (distanceVilles < distance) {
                    markers.push(station);
                }
            }
        }
        return markers;
    }
}

export default map;

