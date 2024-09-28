import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient.ts'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import BranchSelector from './BranchSelector'

interface Message {
    id: string
    conversation_id: string
    content: string
    role: 'user' | 'assistant'
    parent_id: string | null
    created_at: string
}

interface ChatInterfaceProps {
    conversationId: string | null
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [currentBranch, setCurrentBranch] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (conversationId) {
            fetchMessages()
        } else {
            setMessages([])
            setLoading(false)
        }
    }, [conversationId, currentBranch])

    const fetchMessages = async () => {
        if (!conversationId) return

        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            if (error) {
                throw error
            }

            setMessages(data as Message[])
        } catch (err) {
            console.error('Error fetching messages:', err)
            setError('Failed to load messages')
        } finally {
            setLoading(false)
        }
    }

    const addMessage = async (content: string) => {
        if (!conversationId) {
            setError('No active conversation. Please create a new chat first.')
            return
        }

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    content,
                    role: 'user',
                    parent_id: currentBranch
                })
                .single()

            if (error) {
                throw error
            }

            setMessages((prevMessages) => [...prevMessages, data as Message])

            const botResponse = await addBotMessage(`You said: ${content}`)
            
            if (botResponse) {
                setMessages((prevMessages) => [...prevMessages, botResponse])
            }
        } catch (err) {
            console.error('Error adding message:', err)
            setError('Failed to send message')
        }
    }

    const addBotMessage = async (content: string) => {
        if (!conversationId) return null

        try {
            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    content,
                    role: 'assistant',
                    parent_id: currentBranch
                })
                .single()

            if (error) {
                throw error
            }

            return data as Message
        } catch (err) {
            console.error('Error adding bot message:', err)
            return null
        }
    }

    if (loading) {
        return <div>Loading chat...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <div className="flex flex-col h-screen">
            {conversationId && (
                <BranchSelector
                    conversationId={conversationId}
                    onSelectBranch={setCurrentBranch}
                />
            )}
            <MessageList messages={messages} />
            <MessageInput onSendMessage={addMessage} />
        </div>
    )
}