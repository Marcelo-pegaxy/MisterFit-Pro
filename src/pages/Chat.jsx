import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ConversationsList from '@/components/chat/ConversationsList';
import ChatWindow from '@/components/chat/ChatWindow';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function Chat() {
    const { user } = useAuth();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(false);
            } catch (error) {
                console.error("Erro ao carregar usuário:", error);
            }
        };
        init();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Carregando chat...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Erro ao carregar dados do usuário.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-4">
            {/* Lista de conversas - Mobile: oculta quando conversa selecionada */}
            <div className={`w-full md:w-1/3 lg:w-1/4 ${selectedConversation ? 'hidden md:block' : ''}`}>
                <div className="space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Chat</h1>
                        <p className="text-gray-500">
                            {['trainer', 'personal'].includes(user.role)
                                ? 'Converse com seus alunos'
                                : 'Converse com seu personal trainer'
                            }
                        </p>
                    </div>
                    
                    <ConversationsList 
                        currentUser={user}
                        onSelectConversation={setSelectedConversation}
                        selectedConversation={selectedConversation}
                    />
                </div>
            </div>

            {/* Área de chat - Mobile: mostra quando conversa selecionada */}
            <div className={`flex-1 ${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-col`}>
                {selectedConversation ? (
                    <Card className="flex-1 flex flex-col">
                        <ChatWindow 
                            conversation={selectedConversation}
                            currentUser={user}
                            onBack={() => setSelectedConversation(null)}
                        />
                    </Card>
                ) : (
                    <Card className="flex-1 flex items-center justify-center">
                        <CardContent className="text-center">
                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                Selecione uma conversa
                            </h3>
                            <p className="text-gray-500">
                                Escolha um contato à esquerda para começar a conversar.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
