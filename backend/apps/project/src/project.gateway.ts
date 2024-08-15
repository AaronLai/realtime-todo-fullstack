import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust this to your needs
  },
})
@Injectable()
export class ProjectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<Socket, string> = new Map();

  handleConnection(client: Socket) {
    console.log('Client connected');
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected');
    const projectId = this.clients.get(client);
    if (projectId) {
      this.clients.delete(client);
    }
  }

  @SubscribeMessage('joinProject')
  handleJoinProject(client: Socket, payload: string): void {
    const projectId = payload;
    this.clients.set(client, projectId);
    client.join(projectId);

    console.log(`Client joined project: ${projectId}`);
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(client: Socket, payload: string): void {
    const projectId = payload;
    if (projectId) {
      this.clients.delete(client);
      client.leave(projectId);

      console.log(`Client left project: ${projectId}`);
    }
  }

  broadcastToProject(projectId: string, message: any) {
    this.server.to(projectId).emit('taskUpdate', message);
  }

  sendTaskUpdate(projectId: string, taskId: string, update: any) {
    this.broadcastToProject(projectId, {
      type: 'taskUpdate',
      data: {
        taskId,
        update
      }
    });
  }
}