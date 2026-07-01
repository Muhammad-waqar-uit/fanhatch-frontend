import { create } from 'zustand'
import type { ChatMessage } from './types'

interface ChatState {
  activeRoomId: string | null
  /** Messages grouped by room id. */
  messagesByRoom: Record<string, ChatMessage[]>
  selectRoom: (roomId: string) => void
  /** Replace the message list for a room (e.g. after a fetch). */
  setMessages: (roomId: string, messages: ChatMessage[]) => void
  /** Append a single message, de-duplicating by id. */
  appendMessage: (message: ChatMessage) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeRoomId: null,
  messagesByRoom: {},
  selectRoom: (roomId) => set({ activeRoomId: roomId }),
  setMessages: (roomId, messages) =>
    set((state) => ({
      messagesByRoom: { ...state.messagesByRoom, [roomId]: messages },
    })),
  appendMessage: (message) =>
    set((state) => {
      const existing = state.messagesByRoom[message.roomId] ?? []
      if (existing.some((m) => m.id === message.id)) return state
      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [message.roomId]: [...existing, message],
        },
      }
    }),
}))
