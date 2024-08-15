import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { WebsocketAuthGuard } from '@auth/auth/websocket-auth.guard';

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
  private connectedClients: Map<string,Socket> = new Map();

  constructor(private websocketAuthGuard: WebsocketAuthGuard) {
    console.log('ProjectGateway constructed');
  }
  async handleConnection(client: Socket) {
    console.log('handleConnection called for client:', client.id);
    try {
      console.log('Attempting to authenticate client:', client.id);
      const context = {
        switchToWs: () => ({
          getClient: () => client,
        }),
      } as ExecutionContext;
  
      const isAuthenticated = await this.websocketAuthGuard.canActivate(context);
      console.log('Authentication result for client', client.id, ':', isAuthenticated);
  
      if (!isAuthenticated) {
        console.log('Disconnecting client due to failed authentication:', client.id);
        client.disconnect(true);
        return;
      }
  
      // Access the payload
      const payload = (client as any).user;
      console.log('Client authenticated and connected successfully:', client.id);
      console.log('User payload:', payload);
      const userId = payload.userId; // Adjust this based on your payload structure
      this.connectedClients.set(userId, client);
      client.data.userId = userId;

      // You can now use the payload as needed
      // For example, you might want to store it in a map or use it for further processing
  
    } catch (error) {
      console.error('Error during client authentication:', error);
      client.disconnect(true);
    }
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

  broadcastToUser(userId: string, event: string, message: any) {
    const client = this.connectedClients.get(userId);
    console.log('Attempting to send message to user:', userId);
    if (client) {
      client.emit(event, message);
      console.log(`Broadcasted to user ${userId}: ${event}`, message);
    } else {
      console.log(`User ${userId} not found or not connected`);
    }
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

  sendTaskDelete(projectId: string, taskId: string , update: any) {
    this.broadcastToProject(projectId, {
      type: 'taskDelete',
      data: {
        taskId,
        update
      }
    });
  }

  sendTaskAdded(projectId: string, taskId: string , update: any) {
    this.broadcastToProject(projectId, {
      type: 'taskAdded',
      data: {
        taskId,
        update
      }
    });
  }



  sendProjectAssignedUpdate(projectId: string, userId: string) {
    this.broadcastToUser(userId, 'projectAssginedUpdate',{
      type: 'projectAssginedUpdate',
      data: {
        projectId,
        userId
      }
    });
  }
}