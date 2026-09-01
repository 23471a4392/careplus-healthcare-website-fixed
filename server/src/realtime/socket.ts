import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { CONFIG } from '../config.js';
import { prisma } from '../db/prisma.js';

let io: SocketIOServer | null = null;

export function initSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: CONFIG.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId as string;
    const role = socket.handshake.query.role as string;

    if (userId) {
      socket.join(`user:${userId}`);
    }
    if (role) {
      socket.join(`role:${role}`);
    }

    socket.on('join_user', (id: string) => {
      socket.join(`user:${id}`);
    });

    socket.on('join_role', (r: string) => {
      socket.join(`role:${r}`);
    });

    socket.on('disconnect', () => {
      // client disconnected
    });
  });

  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO is not initialized!');
  }
  return io;
}

export async function sendNotification(data: {
  recipientId: string;
  senderId?: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}) {
  try {
    // 1. Save to Database
    const notif = await prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        senderId: data.senderId || null,
        type: data.type,
        title: data.title,
        message: data.message,
        entityType: data.entityType || null,
        entityId: data.entityId || null,
        isRead: false
      }
    });

    // 2. Real-time emit to user room
    if (io) {
      io.to(`user:${data.recipientId}`).emit('notification', notif);
    }
    return notif;
  } catch (err) {
    console.error('Error in sendNotification:', err);
    return null;
  }
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

export function emitToRole(role: string, event: string, payload: any) {
  if (io) {
    io.to(`role:${role}`).emit(event, payload);
  }
}

export function emitGlobal(event: string, payload: any) {
  if (io) {
    io.emit(event, payload);
  }
}
