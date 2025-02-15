const isDev = import.meta.env.DEV;

export function debounce(func: (arg0: any) => void, wait: number | undefined) {
    let timeout: number;
    return function (...args: any) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait) as unknown as number;
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
        log: (message: any, ...args: any) => console.log(`[DEBUG] ${message}`, ...args),
        warn: (message: any, ...args: any) => console.warn(`[DEBUG] ${message}`, ...args),
        error: (message: any, ...args: any) => console.error(`[DEBUG] ${message}`, ...args),
        debug: (message: any, ...args: any) => console.debug(`[DEBUG] ${message}`, ...args),
        delay: (message: any, ...args: any) => {
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
