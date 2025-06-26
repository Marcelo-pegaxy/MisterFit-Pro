import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Paperclip, Image as ImageIcon, ArrowLeft, Smile, MoreVertical, MessageSquare } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/config/supabaseClient';

export default function ChatWindow({ conversation, currentUser, onBack }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const conversationId = `${[currentUser.email, conversation.email].sort().join('_')}`;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async () => {
        try {
            const fetchedMessages = await ChatMessage.filter({ with: conversation.email });
            setMessages(fetchedMessages);
            // Marcar mensagens como lidas (opcional, se necessário)
        } catch (error) {
            console.error("Erro ao carregar mensagens:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMessages();
        // Marcar mensagens como lidas ao abrir a conversa
        ChatMessage.markAsRead(conversation.email).catch(() => {});
        // Realtime listener para novas mensagens
        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const newMsg = payload.new;
                    // Só adiciona se for da conversa atual
                    if (
                        (newMsg.sender_email === currentUser.email && newMsg.receiver_email === conversation.email) ||
                        (newMsg.sender_email === conversation.email && newMsg.receiver_email === currentUser.email)
                    ) {
                        setMessages((prev) => [...prev, newMsg]);
                    }
                }
            )
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const messageData = {
                conversation_id: conversationId,
                sender_email: currentUser.email,
                receiver_email: conversation.email,
                content: newMessage.trim(),
                message_type: 'text'
            };

            await ChatMessage.create(messageData);
            setNewMessage('');
            loadMessages();
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (e, type = 'file') => {
        const file = e.target.files[0];
        if (!file) return;

        setIsSending(true);
        try {
            const { file_url } = await UploadFile({ file });
            
            let messageText = '';
            let messageType = 'file';
            
            if (type === 'image' || file.type.startsWith('image/')) {
                messageText = 'Imagem enviada';
                messageType = 'image';
            } else {
                messageText = `Arquivo: ${file.name}`;
                messageType = 'file';
            }
            
            const messageData = {
                conversation_id: conversationId,
                sender_email: currentUser.email,
                receiver_email: conversation.email,
                message: messageText,
                message_type: messageType,
                file_url: file_url
            };

            await ChatMessage.create(messageData);
            loadMessages();
        } catch (error) {
            console.error("Erro ao enviar arquivo:", error);
        } finally {
            setIsSending(false);
            e.target.value = ''; // Limpar input
        }
    };

    const MessageBubble = ({ message, isMe }) => {
        let formattedTime = '-';
        let date = null;
        if (message.created_date) {
            date = new Date(message.created_date);
        }
        if (date && !isNaN(date.getTime())) {
            try {
                formattedTime = formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
            } catch (e) {
                formattedTime = '-';
            }
        }
        return (
            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isMe 
                        ? 'bg-orange-500 text-white rounded-br-md' 
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                    {message.message_type === 'image' ? (
                        <div>
                            <img 
                                src={message.file_url} 
                                alt="Imagem" 
                                className="rounded-lg max-w-full h-auto mb-1 cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => window.open(message.file_url, '_blank')}
                            />
                            <p className="text-sm">{message.content || message.message}</p>
                        </div>
                    ) : message.message_type === 'file' ? (
                        <div className="flex items-center gap-2">
                            <Paperclip className="w-4 h-4" />
                            <a 
                                href={message.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className={`underline hover:no-underline ${isMe ? 'text-orange-100' : 'text-blue-600'}`}
                            >
                                {message.content || message.message}
                            </a>
                        </div>
                    ) : (
                        <p>{message.content || message.message}</p>
                    )}
                    <p className={`text-xs mt-1 ${isMe ? 'text-orange-100' : 'text-gray-500'}`}>
                        {formattedTime}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header da conversa */}
            <CardHeader className="border-b bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <Avatar>
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                                {conversation.full_name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{conversation.full_name}</CardTitle>
                            <p className="text-sm text-gray-500 capitalize">
                                {conversation.role === 'trainer' ? 'Personal Trainer' : 'Aluno'}
                            </p>
                        </div>
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                            <DropdownMenuItem>Limpar Conversa</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            {/* Área de mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                        <p className="text-gray-500">Carregando mensagens...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma mensagem ainda</h3>
                        <p className="text-gray-500 max-w-sm">
                            Comece a conversa! Envie uma mensagem para {conversation.full_name}.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isMe={message.sender_email === currentUser.email}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </CardContent>

            {/* Input de mensagem */}
            <div className="border-t bg-white p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload(e, 'file')}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                    
                    <input
                        type="file"
                        ref={imageInputRef}
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="hidden"
                        accept="image/*"
                    />
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={isSending}
                            >
                                <Paperclip className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top">
                            <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Enviar Imagem
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="w-4 h-4 mr-2" />
                                Enviar Arquivo
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        disabled={isSending}
                        className="flex-1"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    
                    <Button 
                        type="submit" 
                        disabled={isSending || !newMessage.trim()}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
                
                {isSending && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        Enviando...
                    </p>
                )}
            </div>
        </div>
    );
}
