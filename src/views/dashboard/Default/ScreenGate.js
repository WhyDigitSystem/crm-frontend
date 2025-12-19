import { hasPermission } from 'utils/ScreenAccess';

const ScreenGate = ({ screen, permission = 'canRead', children }) => {
    if (!hasPermission(screen, permission)) return null;
    return children;
};

export default ScreenGate;
