// utils/getDeviceId.js
import { nanoid } from 'nanoid';

export function getOrCreateDeviceId(req, res) {
    const cookieName = 'device_id';
    const deviceId = req.cookies?.[cookieName];

    if (!deviceId) {
        const newId = nanoid();
        res.setHeader(
            'Set-Cookie',
            `${cookieName}=${newId}; Path=/; HttpOnly; Max-Age=31536000`
        );
        return newId;
    }

    return deviceId;
}
