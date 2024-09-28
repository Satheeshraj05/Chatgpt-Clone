import { useState } from 'react'
import { Message } from '@/types'
import EditPrompt from './EditPrompt'
import MessageVersions from './MessageVersions'

// Define the MessageListProps type
type MessageListProps = {
    messages: Message[] // Expecting an array of Message objects
}

export default function MessageList({ messages }: MessageListProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showVersionsId, setShowVersionsId] = useState<string | null>(null)

    return (
        <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message) => {
                if (!message || !message.id) {
                    return null; // Skip rendering if message or message.id is null
                }

                return (
                    <div
                        key={message.id}
                        className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                    >
                        <div
                            className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            <span className={`${message.role === 'user' ? 'text-yellow-300' : 'text-green-500'}`}>
                                {/* Custom text color for user and assistant */}
                                {message.content}
                            </span>
                            {message.role === 'user' && (
                                <>
                                    <button
                                        onClick={() => setEditingId(message.id)}
                                        className="ml-2 text-sm underline hover:text-blue-300"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setShowVersionsId(message.id === showVersionsId ? null : message.id)}
                                        className="ml-2 text-sm underline hover:text-blue-300"
                                    >
                                        {message.id === showVersionsId ? 'Hide Versions' : 'Show Versions'}
                                    </button>
                                </>
                            )}
                        </div>
                        {editingId === message.id && (
                            <EditPrompt
                                messageId={message.id}
                                originalContent={message.content}
                                onEdit={() => setEditingId(null)}
                            />
                        )}
                        {showVersionsId === message.id && <MessageVersions messageId={message.id} />}
                    </div>
                );
            })}
        </div>
    );
}
