import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { WsService } from './ws.service';
import { Server, Socket } from 'socket.io';
import { subscribers } from './ws.constants';

export class RoomType {
  socket_id: string;
  account_id: number;
}

@WebSocketGateway({
  namespace: 'ws',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  static all_instances: any = [];
  @WebSocketServer()
  server: Server;
  rooms: RoomType[] = [];

  constructor(private readonly service: WsService) {
    WsGateway.all_instances.push(this);
  }

  // These functions (getObject, getRooms, broadcastToClient) are used in Processors.
  static getObject(): WsGateway {
    return this.all_instances[0];
  }

  async onModuleInit() {}

  async handleDisconnect(client: Socket) {
    await Promise.all([
      this.service.deleteBySocketId(client.id),
      this.disconnect(client),
    ]);
  }

  getRooms(): RoomType[] {
    return this.rooms;
  }

  broadcastToClient(socket_id: string, event_name: string, data: any): boolean {
    return this.server.to(socket_id).emit(event_name, data);
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token
        ? client.handshake.auth.token
        : client.handshake.headers.authorization;
      const decodedToken = await this.service.verifyJwt(token);
      const { user }: { user: any } = decodedToken;
      if (user) {
        this.rooms.push({
          socket_id: client.id,
          account_id: user.id,
        });
        client.data.user = user;
      } else {
        return this.disconnect(client);
      }
    } catch (e) {
      this.server.to(client.id).emit(subscribers.ERRORS.NAME, e);
      return this.disconnect(client);
    }
  }

  customValidator(schema: any, value: any) {
    return schema.safeParse(value);
  }

  private disconnect(client: Socket) {
    this.rooms = this.rooms.filter((room) => room.socket_id !== client.id);
    client.disconnect();
  }
}
