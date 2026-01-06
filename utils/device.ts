export const isIos = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator as any).userAgent?.includes('Windows');
};

export const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  // iOS Safari exposes standalone when launched from home screen
  return (window.navigator as any).standalone === true;
};

export const isIosSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIOS && isSafari;
};

interface MapOptions {
  lat?: number;
  lng?: number;
  query?: string;
  travelMode?: 'd' | 'w';
}

export const getMapUrl = ({ lat, lng, query, travelMode = 'd' }: MapOptions) => {
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';
  if (isIos()) {
    if (hasCoords) {
      return `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=${travelMode}`;
    }
    if (query) {
      return `http://maps.apple.com/?q=${encodeURIComponent(query)}`;
    }
  }

  if (hasCoords) {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  if (query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return 'https://maps.google.com';
};

export const openMap = (options: MapOptions) => {
  const url = getMapUrl(options);
  if (isIos()) {
    window.location.href = url;
    return;
  }
  window.open(url, '_blank');
};
