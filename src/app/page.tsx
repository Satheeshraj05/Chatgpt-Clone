"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient.ts';
import { PlusIcon, ChatBubbleLeftRightIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ChatInterface from '@/components/ChatInterface';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [editingConversation, setEditingConversation] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: fetchedConversations, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Properly use the fetched data
      setConversations(fetchedConversations as Conversation[]);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error fetching conversations:', err);
        setError(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    const title = newTitle.trim() || 'New Conversation';
    try {
      setLoading(true);
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({ title })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Properly use the data returned from the insert
      setConversations((prev) => [newConversation as Conversation, ...prev]);
      setNewTitle('');
      setSelectedConversation(newConversation.id);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error creating conversation:', err);
        setError(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setConversations((prev) => prev.filter((conv) => conv.id !== id));
      if (selectedConversation === id) {
        setSelectedConversation(null);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error deleting conversation:', err);
        setError(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateConversationTitle = async (id: string, newTitle: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('conversations')
        .update({ title: newTitle })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, title: newTitle } : conv))
      );
      setEditingConversation(null);
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error updating conversation title:', err);
        setError(err.message);
      } else {
        console.error('Unknown error:', err);
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-teal-300">Loading conversations...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-gray-100 p-4 flex flex-col">
        <style jsx>{`
          .scrollbar {
            scrollbar-width: thin; /* For Firefox */
            scrollbar-color: #4a4a4a transparent; /* For Firefox */
          }
          .scrollbar::-webkit-scrollbar {
            width: 8px; /* For Chrome, Safari, and Opera */
          }
          .scrollbar::-webkit-scrollbar-track {
            background: transparent; /* Track color */
          }
          .scrollbar::-webkit-scrollbar-thumb {
            background-color: #4a4a4a; /* Thumb color */
            border-radius: 4px; /* Rounded corners */
          }
          .scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #5a5a5a; /* Thumb hover color */
          }
        `}</style>
        <button
          onClick={createNewConversation}
          className="flex items-center justify-center w-full py-2 px-4 mb-4 bg-teal-500 hover:bg-teal-600 text-white rounded transition duration-150 ease-in-out"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Chat
        </button>
        <div className="flex-grow overflow-y-auto scrollbar">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="mb-2">
              {editingConversation === conversation.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateConversationTitle(conversation.id, newTitle);
                  }}
                  className="flex items-center"
                >
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-grow p-1 bg-gray-700 text-white rounded"
                  />
                  <button type="submit" className="ml-2 text-teal-300 hover:text-teal-200">
                    Save
                  </button>
                </form>
              ) : (
                <div className="flex items-center">
                  <button
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`flex-grow flex items-center py-2 px-4 rounded text-left transition duration-150 ease-in-out ${
                      selectedConversation === conversation.id
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-300 hover:bg-teal-500 hover:text-white'
                    }`}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingConversation(conversation.id);
                      setNewTitle(conversation.title);
                    }}
                    className="ml-2 text-gray-400 hover:text-teal-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteConversation(conversation.id)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedConversation ? (
          <ChatInterface conversationId={selectedConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-teal-300">
            Select a conversation or start a new one
          </div>
        )}
      </div>
    </div>
  );
}
