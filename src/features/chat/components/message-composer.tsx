'use client'

import { useMutation } from '@tanstack/react-query'
import { Send, Smile } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { env } from '@/config/env'
import { sendMessage } from '../api/chat.api'
import { sendMessageWs } from '../lib/socket'
import { useChatStore } from '../store'

export function MessageComposer({ roomId }: { roomId: string }) {
  const [body, setBody] = useState('')
  const appendMessage = useChatStore((s) => s.appendMessage)

  const { mutate, isPending } = useMutation({
    // Real mode: send over the socket and await the ack with the persisted
    // message. Mock mode: keep the local REST stub. The store de-dupes by id, so
    // the later `message:new` echo is harmless.
    mutationFn: (text: string) =>
      env.useMocks ? sendMessage(roomId, text) : sendMessageWs(roomId, text),
    onSuccess: (message) => {
      appendMessage(message)
    },
    onError: (error) => {
      // Keep the typed text so the user can retry.
      console.error('[chat] failed to send message', error)
    },
  })

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || isPending) return
    mutate(text, { onSuccess: () => setBody('') })
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 p-3">
      <div className="flex flex-1 items-center gap-2 rounded-full bg-[var(--color-surface-2)] px-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message"
          aria-label="Message"
          className="h-11 flex-1 bg-transparent text-sm text-[var(--color-fg)] outline-none placeholder:text-[var(--color-muted)]"
        />
        <Smile className="size-5 shrink-0 text-[var(--color-muted)]" aria-hidden />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="icon"
        className="size-11 rounded-xl"
        disabled={!body.trim() || isPending}
        aria-label="Send message"
      >
        <Send />
      </Button>
    </form>
  )
}
