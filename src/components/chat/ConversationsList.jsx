import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/api/entities';
import { User } from '@/api/entities'; // Changed from UserAccount to User
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConversationsList({ currentUser, onSelectConversation, selectedConversation }) {
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Função auxiliar para obter o papel do usuário
    const getRole = u => u.role || u.user_type;

    const loadConversations = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            let contacts = [];
            const allUsers = await User.list();
            console.log('allUsers:', allUsers); // <-- Depuração: mostrar todos os usuários
            // Personal vê seus alunos
            if (['trainer', 'personal'].includes(getRole(currentUser))) {
                contacts = allUsers.filter(user =>
                    ['student', 'aluno'].includes(getRole(user)) &&
                    user.linked_trainer_email === currentUser.email
                );
            } else if (['student', 'aluno'].includes(getRole(currentUser)) && currentUser.linked_trainer_email) {
                // Aluno vê seu personal
                contacts = allUsers.filter(user =>
                    ['trainer', 'personal'].includes(getRole(user)) &&
                    user.email === currentUser.linked_trainer_email
                );
            }
            // Para cada contato, buscar a última mensagem
            const conversationsData = await Promise.all(
                contacts.map(async (contact) => {
                    // Fallback para ChatMessage.filter
                    let lastMessages = [];
                    let unreadMessages = [];
                    if (typeof ChatMessage.filter === 'function') {
                        const conversationId = `${[currentUser.email, contact.email].sort().join('_')}`;
                        lastMessages = await ChatMessage.filter(
                            { conversation_id: conversationId },
                            '-created_date',
                            1
                        );
                        unreadMessages = await ChatMessage.filter({
                            conversation_id: conversationId,
                            receiver_email: currentUser.email,
                            is_read: false
                        });
                    } else {
                        console.warn('ChatMessage.filter não está implementado.');
                    }
                    return {
                        ...contact,
                        lastMessage: lastMessages[0] || null,
                        unreadCount: unreadMessages.length
                    };
                })
            );
            // Ordenar por última mensagem
            conversationsData.sort((a, b) => {
                if (!a.lastMessage && !b.lastMessage) return 0;
                if (!a.lastMessage) return 1;
                if (!b.lastMessage) return -1;
                return new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date);
            });
            setConversations(conversationsData);
        } catch (error) {
            console.error("Erro ao carregar conversas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // DEBUG: log currentUser para checar role
        console.log('currentUser:', currentUser);
        loadConversations();
        const interval = setInterval(loadConversations, 5000); // Atualizar a cada 5 segundos
        return () => clearInterval(interval);
    }, [currentUser]);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <Card><CardContent className="p-4 h-16 bg-gray-100"></CardContent></Card>
                    </div>
                ))}
            </div>
        );
    }

    if (conversations.length === 0) {
        let emptyMsg = '';
        if (['trainer', 'personal'].includes(getRole(currentUser))) {
            emptyMsg = 'Nenhum aluno vinculado ainda.';
        } else if (['student', 'aluno'].includes(getRole(currentUser))) {
            emptyMsg = 'Você não está vinculado a nenhum personal trainer.';
        } else {
            emptyMsg = 'Nenhum contato encontrado.';
        }
        return (
            <Card>
                <CardContent className="p-8 text-center">
                    <p className="text-gray-500">{emptyMsg}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-2">
            {conversations.map((conversation) => (
                <Card 
                    key={conversation.id} 
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'ring-2 ring-orange-500' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation)}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback className="bg-orange-100 text-orange-600">
                                    {conversation.full_name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-800 truncate">
                                        {conversation.full_name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {conversation.unreadCount > 0 && (
                                            <Badge variant="destructive" className="text-xs">
                                                {conversation.unreadCount}
                                            </Badge>
                                        )}
                                        {conversation.lastMessage && (
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(conversation.lastMessage.created_date), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-500 capitalize mb-1">
                                    {conversation.role === 'trainer' ? 'Personal Trainer' : 
                                     conversation.role === 'student' ? 'Aluno' : 
                                     conversation.role}
                                </p>
                                
                                {conversation.lastMessage && (
                                    <p className="text-sm text-gray-600 truncate">
                                        {conversation.lastMessage.sender_email === currentUser.email ? 'Você: ' : ''}
                                        {conversation.lastMessage.message_type === 'image' ? '📷 Imagem' : 
                                         conversation.lastMessage.message_type === 'file' ? '📎 Arquivo' : 
                                         conversation.lastMessage.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
