import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { WebsocketAuthGuard } from '@auth/auth/websocket-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Adjust this to your specific needs for better security
  },
})
@Injectable()
export class ProjectGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: Map<Socket, string> = new Map();
  private connectedClients: Map<string, Socket> = new Map();

  constructor(private websocketAuthGuard: WebsocketAuthGuard) {
    console.log('ProjectGateway constructed');
  }

  /**
   * Handles new WebSocket connections
   * @param client - The connecting Socket client
   */
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
      const userId = payload.userId; // TODO: Adjust this based on your payload structure
      this.connectedClients.set(userId, client);
      client.data.userId = userId;
    } catch (error) {
      console.error('Error during client authentication:', error);
      client.disconnect(true);
    }
  }

  /**
   * Handles WebSocket disconnections
   * @param client - The disconnecting Socket client
   */
  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const projectId = this.clients.get(client);
    if (projectId) {
      this.clients.delete(client);
    }
    // TODO: Consider removing the client from connectedClients as well
  }

  /**
   * Handles 'joinProject' event
   * @param client - The Socket client
   * @param payload - The project ID
   */
  @SubscribeMessage('joinProject')
  handleJoinProject(client: Socket, payload: string): void {
    const projectId = payload;
    this.clients.set(client, projectId);
    client.join(projectId);
    console.log(`Client ${client.id} joined project: ${projectId}`);
  }

  /**
   * Handles 'leaveProject' event
   * @param client - The Socket client
   * @param payload - The project ID
   */
  @SubscribeMessage('leaveProject')
  handleLeaveProject(client: Socket, payload: string): void {
    const projectId = payload;
    if (projectId) {
      this.clients.delete(client);
      client.leave(projectId);
      console.log(`Client ${client.id} left project: ${projectId}`);
    }
  }

  /**
   * Broadcasts a message to all clients in a project
   * @param projectId - The project ID
   * @param message - The message to broadcast
   */
  private broadcastToProject(projectId: string, message: any) {
    this.server.to(projectId).emit('taskUpdate', message);
  }

  /**
   * Sends a message to a specific user
   * @param userId - The user ID
   * @param event - The event name
   * @param message - The message to send
   */
  private broadcastToUser(userId: string, event: string, message: any) {
    const client = this.connectedClients.get(userId);
    console.log('Attempting to send message to user:', userId);
    if (client) {
      client.emit(event, message);
      console.log(`Broadcasted to user ${userId}: ${event}`, message);
    } else {
      console.log(`User ${userId} not found or not connected`);
    }
  }

  /**
   * Sends a task update to all clients in a project
   * @param projectId - The project ID
   * @param taskId - The task ID
   * @param update - The update data
   */
  sendTaskUpdate(projectId: string, taskId: string, update: any) {
    this.broadcastToProject(projectId, {
      type: 'taskUpdate',
      data: { taskId, update }
    });
  }

  /**
   * Sends a task deletion notification to all clients in a project
   * @param projectId - The project ID
   * @param taskId - The task ID
   * @param update - The update data
   */
  sendTaskDelete(projectId: string, taskId: string, update: any) {
    this.broadcastToProject(projectId, {
      type: 'taskDelete',
      data: { taskId, update }
    });
  }

  /**
   * Sends a task addition notification to all clients in a project
   * @param projectId - The project ID
   * @param taskId - The task ID
   * @param update - The update data
   */
  sendTaskAdded(projectId: string, taskId: string, update: any) {
    this.broadcastToProject(projectId, {
      type: 'taskAdded',
      data: { taskId, update }
    });
  }

  /**
   * Sends a project assignment update to a specific user
   * @param projectId - The project ID
   * @param userId - The user ID
   */
  sendProjectAssignedUpdate(projectId: string, userId: string) {
    this.broadcastToUser(userId, 'projectAssignedUpdate', {
      type: 'projectAssignedUpdate',
      data: { projectId, userId }
    });
  }
}