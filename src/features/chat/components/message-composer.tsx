'use client'

import { useMutation } from '@tanstack/react-query'
import { Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <form
      onSubmit={submit}
      className="flex items-center gap-2 border-t border-[var(--color-border)] p-3"
    >
      <Input
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a message…"
        aria-label="Message"
      />
      <Button type="submit" variant="primary" size="icon" disabled={!body.trim() || isPending}>
        <Send />
      </Button>
    </form>
  )
}
