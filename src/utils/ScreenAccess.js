export const getScreenAccess = () => {
    try {
        return JSON.parse(localStorage.getItem('screenAccess')) || {};
    } catch {
        return {};
    }
};

export const hasPermission = (screenCode, permission = 'canRead') => {
    const access = getScreenAccess();
    return Boolean(access?.[screenCode]?.[permission]);
};
