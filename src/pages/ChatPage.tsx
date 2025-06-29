import React, { useState, useRef, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CFormInput,
  CButton,
} from '@coreui/react'

type Message = {
  role: 'user' | 'assistant'
  message: string
}

interface ChatPageProps {
  clientId: number
}

const ChatPage: React.FC<ChatPageProps> = ({ clientId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg: Message = { role: 'user', message: input.trim() }
    const updatedMessages = [...messages, userMsg]

    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          messages: updatedMessages,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        const assistantMsg: Message = { role: 'assistant', message: data.reply }
        setMessages((prev) => [...prev, assistantMsg])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', message: `Error: ${data.error || 'Something went wrong'}` },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', message: 'Network error. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      sendMessage()
    }
  }

  return (
    <div style={{
      width: '100%',
      marginTop: 40,
      paddingLeft: '2rem',
      paddingRight: '2rem',
      boxSizing: 'border-box',
    }}>
      <CCard style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <CCardBody
          ref={scrollRef}
          style={{
            height: '65vh',
            overflowY: 'auto',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '1.5rem',
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#007bff' : '#e9ecef',
                color: msg.role === 'user' ? '#fff' : '#000',
                padding: '0.6rem 1rem',
                borderRadius: 16,
                maxWidth: '80%',
                whiteSpace: 'pre-wrap',
                fontSize: '0.95rem',
              }}
            >
              {msg.message}
            </div>
          ))}
          {loading && (
            <div style={{ fontStyle: 'italic', color: '#888' }}>Assistant is typing...</div>
          )}
        </CCardBody>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '0 1.5rem 1rem 1.5rem',
          boxSizing: 'border-box',
        }}>
          <CFormInput
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            style={{
              flex: 1,
              border: 'none',
              borderBottom: '1px solid #ccc',
              borderRadius: 0,
              outline: 'none',
              boxShadow: 'none',
              fontSize: '1rem',
              padding: '0.5rem 0',
              backgroundColor: 'transparent',
            }}
          />
          <CButton
            color="primary"
            onClick={sendMessage}
            disabled={loading}
            style={{
              marginLeft: '0.75rem',
              padding: '0.6rem 1.2rem',
              fontSize: '1rem',
              borderRadius: '0.5rem',
            }}
          >
            Send
          </CButton>
        </div>
      </CCard>
    </div>
  )
}

export default ChatPage
