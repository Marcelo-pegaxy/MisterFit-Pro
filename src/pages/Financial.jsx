import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, FinancialStats, Invoices } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
    DollarSign, 
    TrendingUp, 
    Users, 
    AlertCircle, 
    CheckCircle, 
    Clock,
    Search,
    Filter,
    Download,
    Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from 'lucide-react';

export default function Financial() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showGenerateInvoice, setShowGenerateInvoice] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [invoiceForm, setInvoiceForm] = useState({
        amount: '',
        description: '',
        due_date: new Date()
    });

    if (!user) {
        return <div>Carregando usuário...</div>;
    }

    useEffect(() => {
        console.log('user em Financial:', user);
        if (user) {
            loadData();
            // Buscar alunos vinculados ao treinador logado
            User.listLinked().then(setStudents).catch(() => setStudents([]));
        }
    }, [user]);

    const loadData = async () => {
        console.log('loadData chamado');
        if (!user) {
            console.log('loadData: user não definido');
            return;
        }
        setIsLoading(true);
        try {
            console.log('Buscando FinancialStats...');
            const statsData = await FinancialStats.get(user.email);
            console.log('FinancialStats:', statsData);

            console.log('Buscando User.list...');
            const studentsData = await User.list();
            console.log('User.list:', studentsData);

            console.log('Buscando Invoices.filter...');
            const invoicesData = await Invoices.filter({ trainer_email: user.email });
            console.log('Invoices.filter:', invoicesData);

            setStats(statsData);
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Erro ao carregar dados financeiros:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateInvoice = async () => {
        if (!selectedStudent || !invoiceForm.amount || !invoiceForm.description) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        try {
            await Invoices.create({
                student_email: selectedStudent.email,
                trainer_email: user.email,
                amount: parseFloat(invoiceForm.amount),
                description: invoiceForm.description,
                due_date: format(invoiceForm.due_date, 'yyyy-MM-dd')
            });

            setShowGenerateInvoice(false);
            setSelectedStudent(null);
            setInvoiceForm({ amount: '', description: '', due_date: new Date() });
            loadData(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao gerar cobrança:', error);
            alert('Erro ao gerar cobrança: ' + error.message);
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente': return 'text-yellow-600 bg-yellow-50';
            case 'pago': return 'text-green-600 bg-green-50';
            case 'atrasado': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pendente': return <Clock className="w-4 h-4" />;
            case 'pago': return <CheckCircle className="w-4 h-4" />;
            case 'atrasado': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats?.monthlyRevenue?.toFixed(2) || '0,00'}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% em relação ao mês passado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalActiveStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {students.length} alunos no total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendente</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats?.pendingAmount?.toFixed(2) || '0,00'}</div>
                        <p className="text-xs text-muted-foreground">
                            {invoices.filter(inv => inv.status === 'pendente').length} cobranças pendentes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pago este Mês</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">R$ {stats?.paidThisMonth?.toFixed(2) || '0,00'}</div>
                        <p className="text-xs text-muted-foreground">
                            {invoices.filter(inv => inv.status === 'pago' && 
                                new Date(inv.payment_date).getMonth() === new Date().getMonth()).length} pagamentos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Controles e Filtros */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>Cobranças</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Gerencie todas as cobranças dos seus alunos
                            </p>
                        </div>
                        <Dialog open={showGenerateInvoice} onOpenChange={setShowGenerateInvoice}>
                            <DialogTrigger asChild>
                                <Button className="bg-green-600 hover:bg-green-700 text-white">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Nova Cobrança
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Gerar Nova Cobrança</DialogTitle>
                                    <DialogDescription>
                                        Crie uma nova cobrança para um aluno
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <Label>Aluno</Label>
                                        <Select onValueChange={(value) => {
                                            const student = students.find(s => s.email === value);
                                            setSelectedStudent(student);
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um aluno" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {students.filter(student => !!student.email && student.email.trim() !== '').length === 0 ? (
                                                    <SelectItem value="no-student" disabled>
                                                        Nenhum aluno disponível
                                                    </SelectItem>
                                                ) : (
                                                    students
                                                        .filter(student => !!student.email && student.email.trim() !== '')
                                                        .map((student) => (
                                                            <SelectItem key={student.email} value={student.email}>
                                                                {student.full_name || student.name}
                                                            </SelectItem>
                                                        ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Valor (R$)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={invoiceForm.amount}
                                            onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                                            placeholder="0,00"
                                        />
                                    </div>
                                    <div>
                                        <Label>Descrição</Label>
                                        <Input
                                            value={invoiceForm.description}
                                            onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                                            placeholder="Ex: Mensalidade Personal Training"
                                        />
                                    </div>
                                    <div>
                                        <Label>Data de Vencimento</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {format(invoiceForm.due_date, 'dd/MM/yyyy')}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={invoiceForm.due_date}
                                                    onSelect={(date) => setInvoiceForm({...invoiceForm, due_date: date})}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowGenerateInvoice(false)}>
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleGenerateInvoice}>
                                        Gerar Cobrança
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por aluno ou número da cobrança..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="pago">Pago</SelectItem>
                                    <SelectItem value="atrasado">Atrasado</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Aluno</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data de Criação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((invoice) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-mono text-sm">
                                                {invoice.invoice_number}
                                            </TableCell>
                                            <TableCell>
                                                {students.find(s => s.email === invoice.student_email)?.full_name || 
                                                 students.find(s => s.email === invoice.student_email)?.name || 
                                                 invoice.student_email}
                                            </TableCell>
                                            <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                                            <TableCell>{format(new Date(invoice.due_date), 'dd/MM/yyyy')}</TableCell>
                                            <TableCell>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                                    {getStatusIcon(invoice.status)}
                                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                </div>
                                            </TableCell>
                                            <TableCell>{format(new Date(invoice.created_at), 'dd/MM/yyyy')}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <p className="text-muted-foreground">Nenhuma cobrança encontrada</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}