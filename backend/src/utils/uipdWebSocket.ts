import internal from 'stream';
import { IncomingMessage, createServer, Server } from 'http';
import { parse } from 'url';
import { Socket } from 'net';
import { RawData, WebSocket, WebSocketServer } from 'ws';

import { pubsub } from '../utils/externalPubSub';

interface ubiWebSocket extends WebSocket {
    address: string;
    isUipd: boolean;
}

export class uipdWebSocket {
    private wss: WebSocketServer;
    private httpServer: Server;
    private port: number = 4000;

    private countClient: number = 0;

    private white_list: Array<string> = [process.env.UIPD_HOST];

    private async notification(msg: JSON) {
        /** by shkoh 20230329: UIPD로부터 전달받는 메시지 예시(type: 'asset' or 'sensor')
         *
         *  asset인 경우
         *  {
         *      "command": "status",
         *      "type": "asset",
         *      "occur_date": "2022-02-22 12:22:22"
         *      "asset_id": 23,
         *      "asset_name": "자산이름",
         *      "prev_status": 5,
         *      "curr_status": 1,
         *      "alarm_id": 323934,
         *      "alarm_msg": "[응답없음 -> 정상] 통신복구"
         *  }
         *
         *  sensor인 경우
         *  {
         *      "command": "status",
         *      "type": "sensor",
         *      "occur_date": "2022-02-22 12:22:22",
         *      "asset_id": 23,
         *      "asset_name": "자산임",
         *      "sensor_id": 402,
         *      "sensor_name": "센서이름"
         *      "prev_status": 3,
         *      "curr_status": 2,
         *      "prev_level": 3,
         *      "prev_level_s": "위험",
         *      "curr_level": 2,
         *      "curr_level_s": "경고",
         *      "alarm_id": 3234234,
         *      "alamr_msg": "[위험 -> 경고] 자산명: 센서이름 임계치 상한위험 -> 상한주의"
         *  }
         *
         */
        await pubsub.publish('NOTIFICATION', msg);
    }

    private async changeStatus(msg: JSON) {
        await pubsub.publish('CHANGESTATUS', msg);
    }

    public create() {
        this.httpServer = createServer();
        this.wss = new WebSocketServer({ noServer: true });

        this.wss.on(
            'connection',
            (ws: ubiWebSocket, request: IncomingMessage) => {
                const { remoteAddress, remotePort } = request.socket;

                console.info(
                    `WebSocket Client Connection: ${remoteAddress}:${remotePort}`
                );
                console.info(
                    `Client Count: ${this.countClient++} -> ${this.countClient}`
                );

                ws.address = `${remoteAddress}:${remotePort}`;
                ws.isUipd = false;

                ws.on('message', (data: RawData, isBinary: boolean) => {
                    try {
                        const msg = JSON.parse(data.toString());
                        const cmd = msg?.command;

                        if (
                            cmd === 'login' &&
                            msg.user_id === 'uipd' &&
                            msg.type === 'system'
                        ) {
                            this.wss.clients.forEach((ws: ubiWebSocket) => {
                                if (ws.isUipd) {
                                    ws.terminate();
                                }
                            });

                            ws.isUipd = true;
                            console.info(`complete to login UIPD`);
                            return;
                        } else if (
                            ws.address === `${remoteAddress}:${remotePort}` &&
                            cmd === 'status'
                        ) {
                            this.notification(msg);
                            this.changeStatus(msg);
                        }
                    } catch {}
                });

                ws.on('close', (code: number, reason: Buffer) => {
                    console.info(
                        `Client Count: ${this.countClient--} -> ${
                            this.countClient
                        }`
                    );
                    if (`${remoteAddress}:${remotePort}` === ws.address) {
                        console.info(`closed uipd: ${ws.address}`);
                    }

                    console.info(code, reason.toString());
                });
            }
        );

        this.wss.on('close', () => {
            console.info('UIPD WEB SOCKET SERVER CLOSED');
        });

        this.wss.on('error', (error) => {
            console.error(error);
        });

        this.httpServer.on('clientError', (err: Error) => {
            console.info(err);
        });

        this.httpServer.on(
            'upgrade',
            (
                request: IncomingMessage,
                socket: internal.Duplex,
                head: Buffer
            ) => {
                const { pathname } = parse(request.url);
                const { remoteAddress } = request.socket;

                // by shkoh 20230403: UIPD가 중복되는 접속되는 문제가 발생할 수 있는 문제를 사전에 차단하기 위해서 White List를 설정한 경우에 해당 White List의 IP 주소를 따른다
                // by shkoh 20230403: White List가 없는 경우에는 들어오는 모든 연결에 필터를 수행하지 않는다
                const is_white_list =
                    this.white_list.length === 0
                        ? true
                        : this.white_list.some((ip: string) =>
                              remoteAddress.includes(ip)
                          );
                if (is_white_list && pathname === '/wsapi') {
                    this.wss.handleUpgrade(
                        request,
                        socket as Socket,
                        head,
                        (ws: WebSocket, request: IncomingMessage) => {
                            this.wss.emit('connection', ws, request);
                        }
                    );
                } else {
                    socket.destroy();
                }
            }
        );

        this.httpServer.on('error', (error) => {
            console.info('httpServer', error);
        });

        this.httpServer.listen(this.port);
    }
}
