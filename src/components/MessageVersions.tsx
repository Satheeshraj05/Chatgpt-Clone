// src/components/MessageVersions.tsx
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient.ts'

interface MessageVersion {
    id: string
    content: string
    created_at: string
}

interface MessageVersionsProps {
    messageId: string
}

export default function MessageVersions({ messageId }: MessageVersionsProps) {
    const [versions, setVersions] = useState<MessageVersion[]>([])

    useEffect(() => {
        fetchVersions()
    }, [messageId])

    const fetchVersions = async () => {
        const { data, error } = await supabase
            .from('message_versions')
            .select('*')
            .eq('message_id', messageId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching message versions:', error)
        } else {
            setVersions(data)
        }
    }

    return (
        <div className="mt-2">
            <h4 className="font-bold">Previous Versions:</h4>
            {versions.map((version) => (
                <div key={version.id} className="mt-1 p-2 bg-gray-100 rounded">
                    <p>{version.content}</p>
                    <small>{new Date(version.created_at).toLocaleString()}</small>
                </div>
            ))}
        </div>
    )
}