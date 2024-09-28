import { useState } from 'react';
import { supabase } from '../lib/supabaseClient.ts';

interface EditPromptProps {
    messageId: string;
    originalContent: string;
    onEdit: () => void; // Callback function to notify when editing is done
}

export default function EditPrompt({
    messageId,
    originalContent,
    onEdit,
}: EditPromptProps) {
    const [content, setContent] = useState<string>(originalContent); // State to hold the new content
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim() && content !== originalContent) {
            setIsLoading(true);
            setError(null); // Reset error message

            try {
                // Store the original version (optional)
                await supabase.from('message_versions').insert({
                    message_id: messageId,
                    content: originalContent,
                });

                // Update the message in the database
                const { error: updateError } = await supabase
                    .from('messages')
                    .update({ content })
                    .eq('id', messageId);

                if (updateError) {
                    throw new Error('Error updating message: ' + updateError.message);
                } else {
                    onEdit(); // Call the callback to notify that editing is complete
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred.');
                }
                console.error('Error:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2">
            <label htmlFor={`edit-prompt-${messageId}`} className="sr-only">
                Edit Message
            </label>
            <textarea
                id={`edit-prompt-${messageId}`} // Unique ID for accessibility
                value={content}
                onChange={(e) => setContent(e.target.value)} // Update local state as user types
                className="w-full p-2 bg-teal-500 text-white rounded" // Changed color here
                disabled={isLoading} // Disable while loading
            />
            {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
            <button
                type="submit"
                className="mt-2 p-2 bg-blue-500 text-white rounded"
                disabled={isLoading} // Disable button while loading
            >
                {isLoading ? 'Saving...' : 'Save Edit'}
            </button>
        </form>
    );
}
