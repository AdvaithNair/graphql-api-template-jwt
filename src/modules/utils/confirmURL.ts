import {v4} from 'uuid';
import redis from '../../redis';
import { FRONTEND_URL } from '../../secrets';

const URL_EXPIRATION: number = 60 * 60 * 24; // Expires in 1 Day

const createConfirmationURL = async (userID: number) => {
    const token: string = v4();
    await redis.set(token, userID, 'ex', URL_EXPIRATION)

    return FRONTEND_URL + `/user/confirm/${token}`
}

export default createConfirmationURL;