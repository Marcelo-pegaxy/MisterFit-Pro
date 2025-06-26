import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User as UserIcon, Shield } from 'lucide-react';

const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
};

const AppLogo = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
        <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ee7cadce2_novologo.png" 
            alt="MisterFit Logo" 
            className="w-12 h-12 object-contain"
        />
        <h1 className="text-3xl font-bold text-gray-800">MisterFit</h1>
    </div>
);

export default function CompleteProfile() {
    const { user, completeProfile } = useAuth();
    const [selectedRole, setSelectedRole] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const handleRoleSelection = (role) => {
        setSelectedRole(role);
        setError('');
    };

    const handleCompleteProfile = async () => {
        if (!selectedRole) {
            setError('Por favor, selecione um tipo de conta');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            await completeProfile(selectedRole);
        } catch (error) {
            setError('Erro ao completar perfil. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
                <AppLogo />
                <Card className="w-full max-w-lg">
                    <CardContent className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                        <p className="text-gray-600">Carregando...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
            <AppLogo />
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Complete seu Cadastro</CardTitle>
                    <CardDescription>
                        Olá, {user.full_name}! Para continuar, escolha seu tipo de conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <button
                            onClick={() => handleRoleSelection('student')}
                            className={`p-6 border-2 rounded-lg text-center transition-all ${
                                selectedRole === 'student' 
                                    ? 'border-orange-500 bg-orange-50' 
                                    : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <UserIcon className="w-10 h-10 mx-auto mb-3 text-orange-600" />
                            <h3 className="font-semibold text-lg">Sou Aluno</h3>
                            <p className="text-sm text-gray-500">Quero receber treinos e dietas.</p>
                        </button>
                        
                        <button
                            onClick={() => handleRoleSelection('trainer')}
                            className={`p-6 border-2 rounded-lg text-center transition-all ${
                                selectedRole === 'trainer' 
                                    ? 'border-orange-500 bg-orange-50' 
                                    : 'border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            <Shield className="w-10 h-10 mx-auto mb-3 text-orange-600" />
                            <h3 className="font-semibold text-lg">Sou Personal Trainer</h3>
                            <p className="text-sm text-gray-500">Quero gerenciar alunos e treinos.</p>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <Button 
                            onClick={handleCompleteProfile}
                            disabled={!selectedRole || isSaving}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Completando cadastro...
                                </>
                            ) : (
                                'Continuar'
                            )}
                        </Button>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Você poderá alterar essa configuração posteriormente nas configurações da sua conta.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
