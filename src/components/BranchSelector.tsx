// src/components/BranchSelector.tsx
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient.ts'

interface Branch {
    id: string
    content: string
    created_at: string
}

interface BranchSelectorProps {
    conversationId: string
    onSelectBranch: (branchId: string | null) => void
}

export default function BranchSelector({
    conversationId,
    onSelectBranch,
}: BranchSelectorProps) {
    const [branches, setBranches] = useState<Branch[]>([])

    useEffect(() => {
        fetchBranches()
    }, [conversationId])

    const fetchBranches = async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('id, content, created_at')
            .eq('conversation_id', conversationId)
            .is('parent_id', null)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching branches:', error)
        } else {
            setBranches(data as Branch[])
        }
    }

    return (
        <div className="p-4 border-b">
            <h3 className="font-bold mb-2">Conversation Branches</h3>
            <ul className="space-y-2">
                <li>
                    <button
                        onClick={() => onSelectBranch(null)}
                        className="w-full text-left p-2 hover:bg-gray-100 rounded"
                    >
                        Main Branch
                    </button>
                </li>
                {branches.map((branch) => (
                    <li key={branch.id}>
                        <button
                            onClick={() => onSelectBranch(branch.id)}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded"
                        >
                            <span className="font-medium">{branch.content.substring(0, 30)}...</span>
                            <br />
                            <small className="text-gray-500">
                                {new Date(branch.created_at).toLocaleString()}
                            </small>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}