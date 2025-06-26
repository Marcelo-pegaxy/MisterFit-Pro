import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';

const LinkStudentForm = ({ trainer, onStudentLinked }) => {
    const [shareId, setShareId] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLinking(true);
        setError('');
        setSuccess('');

        if (!shareId.trim()) {
            setError("Por favor, insira o ID do aluno.");
            setIsLinking(false);
            return;
        }

        try {
            // 1. Buscar TODOS os usuários e filtrar manualmente por ID de compartilhamento
            const allUsers = await User.list();
            console.log('DEBUG - Todos os usuários:', allUsers);
            console.log('DEBUG - ID informado:', shareId.trim().toUpperCase());
            const studentsToLink = allUsers.filter(user => 
                user.unique_share_id === shareId.trim().toUpperCase() && 
                (user.role === 'student' || user.user_type === 'aluno')
            );
            console.log('DEBUG - Alunos encontrados:', studentsToLink);
            
            if (studentsToLink.length === 0) {
                // Mostrar todos os IDs disponíveis para debug
                const allStudentIds = allUsers
                    .filter(u => u.role === 'student' && u.unique_share_id)
                    .map(u => u.unique_share_id)
                    .join(', ');
                
                setError(`Nenhum aluno encontrado com este ID. IDs disponíveis: ${allStudentIds || 'Nenhum'}`);
                setIsLinking(false);
                return;
            }

            const student = studentsToLink[0];

            if (student.linked_trainer_email) {
                setError(`Este aluno já está vinculado a ${student.linked_trainer_email === trainer.email ? 'você' : 'outro personal'}.`);
                setIsLinking(false);
                return;
            }

            // 2. Vincular o aluno ao personal trainer
            await User.update(student.id, { linked_trainer_email: trainer.email });
            
            setSuccess(`Aluno ${student.full_name} vinculado com sucesso!`);
            setShareId('');
            setTimeout(() => {
                onStudentLinked();
            }, 1500);

        } catch (err) {
            console.error("Erro ao vincular aluno:", err);
            setError("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
                <Label htmlFor="shareId">ID de Compartilhamento do Aluno</Label>
                <Input 
                    id="shareId" 
                    value={shareId} 
                    onChange={e => setShareId(e.target.value)} 
                    placeholder="Peça ao seu aluno para fornecer o ID dele"
                    required 
                />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Fechar</Button>
                </DialogClose>
                <Button type="submit" disabled={isLinking} className="bg-orange-500 hover:bg-orange-600 text-white">
                    {isLinking ? 'Vinculando...' : 'Vincular Aluno'}
                </Button>
            </DialogFooter>
        </form>
    );
};

export default function StudentsPage() {
    const { user } = useAuth();
    const [linkedStudents, setLinkedStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchLinkedStudents = async (trainer) => {
        if (!trainer) return;
        setIsLoading(true);
        try {
            // Buscar todos os usuários e filtrar manualmente
            const allUsers = await User.list();
            const fetchedStudents = allUsers.filter(user => 
                (user?.user_type === 'aluno' || user?.role === 'student') && 
                user?.linked_trainer_email === trainer.email
            );
            // Ordenar por data de criação (mais recente primeiro)
            fetchedStudents.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
            setLinkedStudents(fetchedStudents);
        } catch (error) {
            console.error("Erro ao buscar alunos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && (user.user_type === 'personal' || user.user_type === 'trainer' || user.user_type === 'admin')) {
            fetchLinkedStudents(user);
        } else {
            setIsLoading(false);
        }
    }, [user]);

    const handleStudentLinked = () => {
        setIsFormOpen(false);
        fetchLinkedStudents(user);
    };

    if (!user || (user.user_type !== 'personal' && user.user_type !== 'trainer' && user.user_type !== 'admin')) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-500">Acesso negado. Esta página é apenas para personal trainers ou administradores.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Meus Alunos</h1>
                    <p className="text-gray-500">Gerencie seus alunos vinculados.</p>
                </div>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                            <LinkIcon className="mr-2 h-4 w-4" /> Adicionar Aluno por ID
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Vincular Novo Aluno</DialogTitle>
                            <DialogDescription>
                                Insira o ID de compartilhamento fornecido pelo seu aluno para vinculá-lo à sua conta.
                            </DialogDescription>
                        </DialogHeader>
                        <LinkStudentForm trainer={user} onStudentLinked={handleStudentLinked} />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Data de Cadastro</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan="3" className="text-center">Carregando...</TableCell></TableRow>
                        ) : linkedStudents.length > 0 ? (
                            linkedStudents.map(student => (
                                <TableRow key={student.id} className="hover:bg-gray-50 cursor-pointer">
                                    <TableCell className="font-medium">
                                        <Link to={`/student/${student.id}`} className="block w-full h-full py-4">
                                            {student.full_name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                         <Link to={`/student/${student.id}`} className="block w-full h-full py-4">
                                            {student.email}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                         <Link to={`/student/${student.id}`} className="block w-full h-full py-4">
                                            {student.created_date && !isNaN(new Date(student.created_date))
                                                ? format(new Date(student.created_date), 'dd/MM/yyyy')
                                                : '—'}
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan="3" className="text-center">Nenhum aluno vinculado encontrado.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
