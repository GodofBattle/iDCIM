import { Readable } from 'stream';

const streamToBuffer = (stream: Readable, mimeType: string = null): Buffer | any => {
    if (mimeType != null && typeof mimeType !== 'string') {
        throw new Error('Invalid mimeType, expected string.');
    }

    return new Promise((resolve, reject) => {
        let chunks = Buffer.alloc(0);

        stream
            .on('data', chunk => chunks = Buffer.concat([chunks, Buffer.from(chunk)]))
            .once('end', () => {
                resolve(chunks);
            })
            .once('error', reject)
    });
}

export default streamToBuffer;