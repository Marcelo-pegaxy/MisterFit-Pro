import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit3, Camera, Copy, CheckCircle, Upload, Loader2 } from 'lucide-react';
import { UploadFile } from '@/api/integrations';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [copiedId, setCopiedId] = useState(false);
    const [editData, setEditData] = useState(user || {});

    useEffect(() => {
        setEditData(user || {});
    }, [user]);

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsSaving(true);
        try {
            const { file_url } = await UploadFile({ file });
            setEditData({ ...editData, profile_photo: file_url });
            setMessage({ type: 'success', text: 'Foto atualizada com sucesso!' });
        } catch (error) {
            console.error("Erro ao fazer upload da foto:", error);
            setMessage({ type: 'error', text: 'Erro ao carregar foto. Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        try {
            const dataToSave = {
                full_name: editData.full_name,
                phone: editData.phone,
                birthdate: editData.birthdate,
                gender: editData.gender,
                city: editData.city,
                bio: editData.bio,
                profile_photo: editData.profile_photo,
            };
            await updateUser(dataToSave);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
        } finally {
            setIsSaving(false);
        }
    };

    const copyIdToClipboard = () => {
        if (user?.unique_share_id) {
            navigator.clipboard.writeText(user.unique_share_id);
            setCopiedId(true);
            setTimeout(() => setCopiedId(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
                    <p className="text-gray-500">Gerencie suas informações pessoais</p>
                </div>
                <Button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                    {isSaving ? 'Salvando...' : isEditing ? 'Salvar' : <><Edit3 className="w-4 h-4 mr-2" />Editar Perfil</>}
                </Button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Foto e Informações Básicas */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Foto do Perfil</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="relative inline-block">
                            <Avatar className="w-32 h-32 mx-auto">
                                <AvatarImage src={isEditing ? editData.profile_photo : user.profile_photo} />
                                <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                                    {user.full_name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full cursor-pointer">
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">{user.full_name}</h3>
                            <Badge className="mt-2 bg-blue-100 text-blue-800 capitalize">
                                {user.user_type === 'aluno' ? 'Aluno' : 'Personal Trainer'}
                            </Badge>
                        </div>

                        {/* ID de Compartilhamento para Alunos */}
                        {user.user_type === 'aluno' && user.unique_share_id && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <Label className="text-sm font-medium text-gray-700">Seu ID de Compartilhamento</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-lg p-2 flex-1">
                                        {user.unique_share_id}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={copyIdToClipboard}
                                        className="flex-shrink-0"
                                    >
                                        {copiedId ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Compartilhe este ID com seu personal trainer para que ele possa te vincular.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Informações Detalhadas */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Informações Detalhadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="space-y-4">
                            <div>
                                <Label htmlFor="full_name">Nome Completo</Label>
                                <Input
                                    id="full_name"
                                    value={editData.full_name || ''}
                                    onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    value={editData.phone || ''}
                                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="birthdate">Data de Nascimento</Label>
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={editData.birthdate || ''}
                                    onChange={e => setEditData({ ...editData, birthdate: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="gender">Gênero</Label>
                                <Input
                                    id="gender"
                                    value={editData.gender || ''}
                                    onChange={e => setEditData({ ...editData, gender: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={editData.city || ''}
                                    onChange={e => setEditData({ ...editData, city: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={editData.bio || ''}
                                    onChange={e => setEditData({ ...editData, bio: e.target.value })}
                                    disabled={!isEditing}
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
