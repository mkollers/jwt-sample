/// <reference path="../typings/index.d.ts" />

import * as crypto from 'crypto';

export const encode = (payload: any, secret: string): string => {
    const algorithm = 'HS256';

    const header = {
        typ: 'JWT',
        alg: algorithm
    };

    let jwt = base64Encode(JSON.stringify(header)) + '.' + base64Encode(JSON.stringify(payload));
    return jwt + '.' + sign(jwt, secret);
};

export const decode = (token: string, secret: string): any => {
    const segments = token.split('.');

    if (segments.length !== 3) {
        throw new Error('Token structure incorrect');
    }

    const header = JSON.parse(base64Decode(segments[0]));
    const payload = JSON.parse(base64Decode(segments[1]));

    const rawSignature = segments[0] + '.' + segments[1];

    if (!verify(rawSignature, secret, segments[2])) {
        throw new Error('Verification failed');
    }

    return payload;
};

/////////////////////////////

function base64Encode(data: any): string {
    return new Buffer(data).toString('base64');
}

function base64Decode(str: string): string {
    return new Buffer(str).toString('base64');
}

function sign(str: string, key: string): string {
    return crypto.createHmac('sha256', key).update(str).digest('base64');
}

function verify(raw: string, secret: string, signature: string): boolean {
    return signature === sign(raw, secret);
}