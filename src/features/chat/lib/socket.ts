import { io, type Socket } from 'socket.io-client'
import { env } from '@/config/env'
import { mapMessage } from '../api/chat.api'
import type { ChatMessage, ChatMessageDto, ChatMessageTypeDto } from '../types'

/** Ack envelope the gateway returns for client→server events. */
export interface SocketAck<T = unknown> {
  ok: boolean
  error?: string
  data?: T
}

/** Typed event names for the `/chat` namespace (see chat-realtime-contract.md). */
export const ChatSocketEvents = {
  /** Client → server. */
  JoinRoom: 'room:join',
  LeaveRoom: 'room:leave',
  SendMessage: 'message:send',
  /** Server → client. */
  MessageNew: 'message:new',
  RoomJoined: 'room:joined',
  AccessRevoked: 'access:revoked',
  Error: 'error',
} as const

export interface ServerToClientEvents {
  'message:new': (message: ChatMessageDto) => void
  'room:joined': (payload: { roomId: string }) => void
  'access:revoked': (payload: { roomId: string }) => void
  error: (payload: { code: string; message: string }) => void
}

export interface ClientToServerEvents {
  'room:join': (
    payload: { roomId: string },
    ack: (res: SocketAck<{ roomId: string }>) => void,
  ) => void
  'room:leave': (payload: { roomId: string }, ack: (res: SocketAck) => void) => void
  'message:send': (
    payload: { roomId: string; body: string; type?: ChatMessageTypeDto },
    ack: (res: SocketAck<ChatMessageDto>) => void,
  ) => void
}

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: ChatSocket | null = null

/**
 * Lazily creates (and reuses) the `/chat` socket.io connection.
 * Returns `null` in mock mode and during SSR so no real connection is opened.
 */
export function getChatSocket(): ChatSocket | null {
  if (env.useMocks) return null
  if (typeof window === 'undefined') return null

  if (!socket) {
    socket = io(`${env.wsUrl}/chat`, {
      auth: { token: localStorage.getItem('accessToken') },
      autoConnect: true,
    })
  }
  return socket
}

/** Ask the gateway to join a room channel (no-op in mock/SSR). */
export function joinRoom(roomId: string): void {
  getChatSocket()?.emit(ChatSocketEvents.JoinRoom, { roomId }, () => {})
}

/** Leave a room channel (no-op in mock/SSR). */
export function leaveRoom(roomId: string): void {
  getChatSocket()?.emit(ChatSocketEvents.LeaveRoom, { roomId }, () => {})
}

/**
 * Send a message over the socket and resolve with the persisted message from the
 * ack. Rejects in mock/SSR mode or when the gateway reports a failure.
 */
export function sendMessageWs(roomId: string, body: string): Promise<ChatMessage> {
  return new Promise((resolve, reject) => {
    const s = getChatSocket()
    if (!s) {
      reject(new Error('Chat socket unavailable'))
      return
    }
    s.emit(ChatSocketEvents.SendMessage, { roomId, body, type: 'text' }, (res) => {
      if (res.ok && res.data) {
        resolve(mapMessage(res.data))
      } else {
        reject(new Error(res.error ?? 'message:send failed'))
      }
    })
  })
}

/** Subscribe to incoming messages. Returns an unsubscribe fn (no-op in mock/SSR). */
export function onMessage(cb: (message: ChatMessage) => void): () => void {
  const s = getChatSocket()
  if (!s) return () => {}
  const handler = (dto: ChatMessageDto): void => cb(mapMessage(dto))
  s.on(ChatSocketEvents.MessageNew, handler)
  return () => {
    s.off(ChatSocketEvents.MessageNew, handler)
  }
}

/** Subscribe to access-revoked events. Returns an unsubscribe fn (no-op in mock/SSR). */
export function onAccessRevoked(cb: (payload: { roomId: string }) => void): () => void {
  const s = getChatSocket()
  if (!s) return () => {}
  s.on(ChatSocketEvents.AccessRevoked, cb)
  return () => {
    s.off(ChatSocketEvents.AccessRevoked, cb)
  }
}

/** Tear down the active connection (e.g. on logout). */
export function disconnectChatSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
