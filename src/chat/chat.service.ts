import * as crypto from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { isEmpty } from 'class-validator';
import { Server, Socket } from 'socket.io';

const users = [
  {
    id: 1,
    email: 'tom@gmail.com',
    password: 'tom-user',
  },
  {
    id: 2,
    email: 'james@gmail.com',
    password: 'james-user',
  },
];

@Injectable()
export class ChatService {
  private readonly serviceId: string;
  private readonly logger: Logger;
  private server: Server;

  constructor() {
    this.logger = new Logger(ChatService.name);
    this.serviceId = crypto.randomUUID().split('-')[0];
  }

  setServer(server: Server) {
    this.server = server;
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Socket ${client.id} connected to the server`);
      const {
        email,
        password,
      }: {
        email?: string;
        password?: string;
      } = client.handshake.auth;
      if (isEmpty(email) || isEmpty(password)) {
        throw new Error('Credentials not provided');
      }
      const user = users.find(
        (u) => u.email === email.toLowerCase() && u.password === password,
      );
      if (!user) {
        throw new Error('Invalid Credentials');
      }
      client.data.user = {
        id: user.id,
        email: user.email,
      };
      client.emit('user-connected', {
        message: 'Welcome to the server',
      });
    } catch (error) {
      this.logger.error(error);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      this.logger.log(`Socket ${client.id} disconnected from the server`);
      client.disconnect(true);
    } catch (error) {
      this.logger.error(error);
      client.disconnect(true);
    }
  }

  async handleEchoEvent(
    client: Socket,
    payload: {
      message?: string;
    },
  ) {
    return {
      message: `Server echo [${this.serviceId}]: ${payload.message}`,
    };
  }
}
