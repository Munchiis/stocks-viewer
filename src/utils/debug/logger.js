const isDev = import.meta.env.DEV;
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    }
}

export const createLogger = (enabled = true) => {
    if (!enabled) {
        return {
            log: () => { },
            warn: () => { },
            debug: () => { },
            error: () => { },
            delay: () => { }
        }
    }

    const logMessages = new Map();
    const THROTTLE_MS = 1000;

    return {
        log: (message, ...args) => console.log(`[DEBUG] ${message}`, ...args),
        warn: (message, ...args) => console.warn(`[DEBUG] ${message}`, ...args),
        error: (message, ...args) => console.error(`[DEBUG] ${message}`, ...args),
        debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
        delay: (message, ...args) => {
            const currentTimestamp = Date.now();
            const lastMessageTimestamp = logMessages.get(message) || 0;

            if (currentTimestamp - lastMessageTimestamp >= THROTTLE_MS) {
                console.log(`[DEBUG] ${message}`, ...args);
                logMessages.set(message, currentTimestamp);
            }
        }
    };
}

export const logger = createLogger(isDev);
