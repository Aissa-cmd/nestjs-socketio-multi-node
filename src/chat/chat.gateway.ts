import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'ws/v1/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger: Logger;
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {
    this.logger = new Logger(ChatGateway.name);
  }

  async afterInit(server: Server) {
    this.chatService.setServer(server);
  }

  async handleConnection(client: Socket) {
    return this.chatService.handleConnection(client);
  }

  async handleDisconnect(client: Socket) {
    return this.chatService.handleDisconnect(client);
  }

  @SubscribeMessage('echo')
  async handleEchoEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      message?: string;
    },
  ) {
    return this.chatService.handleEchoEvent(client, payload);
  }
}
