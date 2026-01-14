import { useState, useEffect } from 'react';

interface Coords {
    lat: number;
    lng: number;
}

interface GeolocationState {
    coords: Coords | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        coords: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(s => ({ ...s, error: 'Geolocation not supported', loading: false }));
            return;
        }

        const success = (position: GeolocationPosition) => {
            setState({
                coords: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                },
                error: null,
                loading: false,
            });
        };

        const error = (err: GeolocationPositionError) => {
            setState(s => ({ ...s, error: err.message, loading: false }));
        };

        // Watch position
        const id = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        });

        return () => navigator.geolocation.clearWatch(id);
    }, []);

    return state;
}
