import React, { useState, useEffect } from 'react';
import { StudentFinancials, Invoices } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CalendarIcon, Receipt, Copy, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GenerateInvoiceDialog = ({ student, financials, onInvoiceGenerated }) => {
    const [invoiceData, setInvoiceData] = useState({
        amount: financials?.amount || '',
        description: `Mensalidade Personal Training - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        due_date: financials?.next_due_date ? new Date(financials.next_due_date) : new Date(),
    });
    const [generatedInvoice, setGeneratedInvoice] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateInvoice = async () => {
        setIsGenerating(true);
        
        try {
            const invoice = await Invoices.create({
                student_email: student.email,
                trainer_email: financials.trainer_email,
                amount: parseFloat(invoiceData.amount),
                description: invoiceData.description,
                due_date: format(invoiceData.due_date, 'yyyy-MM-dd')
            });
            
            setGeneratedInvoice(invoice);
            setIsGenerating(false);
        } catch (error) {
            console.error('Erro ao gerar cobrança:', error);
            alert('Erro ao gerar cobrança: ' + error.message);
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendInvoiceToStudent = () => {
        // Aqui seria integrado com um sistema de email real
        alert(`Cobrança enviada por email para ${student.email}!`);
        onInvoiceGenerated();
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Gerar Cobrança para {student.full_name}
                </DialogTitle>
                <DialogDescription>
                    Configure os detalhes da cobrança que será enviada ao aluno.
                </DialogDescription>
            </DialogHeader>

            {!generatedInvoice ? (
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="amount">Valor (R$)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={invoiceData.amount}
                                onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
                                placeholder="0,00"
                            />
                        </div>
                        <div>
                            <Label>Data de Vencimento</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(invoiceData.due_date, 'dd/MM/yyyy')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={invoiceData.due_date}
                                        onSelect={(date) => setInvoiceData({...invoiceData, due_date: date})}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="description">Descrição da Cobrança</Label>
                        <Input
                            id="description"
                            value={invoiceData.description}
                            onChange={(e) => setInvoiceData({...invoiceData, description: e.target.value})}
                            placeholder="Ex: Mensalidade Personal Training"
                        />
                    </div>

                    <DialogFooter>
                        <Button 
                            onClick={generateInvoice}
                            disabled={isGenerating || !invoiceData.amount}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isGenerating ? 'Gerando...' : 'Gerar Cobrança'}
                        </Button>
                    </DialogFooter>
                </div>
            ) : (
                <div className="space-y-4 py-4">
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Cobrança Gerada com Sucesso!</AlertTitle>
                        <AlertDescription className="text-green-700">
                            A cobrança foi criada e está pronta para ser enviada ao aluno.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Detalhes da Cobrança</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><strong>ID:</strong> {generatedInvoice.invoice_number}</div>
                                <div><strong>Valor:</strong> R$ {generatedInvoice.amount.toFixed(2)}</div>
                                <div><strong>Vencimento:</strong> {format(new Date(generatedInvoice.due_date), 'dd/MM/yyyy')}</div>
                                <div><strong>Status:</strong> <span className="text-yellow-600">Pendente</span></div>
                            </div>
                            
                            <div>
                                <strong>Descrição:</strong>
                                <p className="text-gray-600">{generatedInvoice.description}</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Link de Pagamento</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={generatedInvoice.payment_link} readOnly className="flex-1" />
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => copyToClipboard(generatedInvoice.payment_link, 'link')}
                                    >
                                        {copied === 'link' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Código PIX</Label>
                                <div className="flex items-center gap-2">
                                    <Input value={generatedInvoice.pix_code} readOnly className="flex-1 text-xs" />
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => copyToClipboard(generatedInvoice.pix_code, 'pix')}
                                    >
                                        {copied === 'pix' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setGeneratedInvoice(null)}>
                            Gerar Nova Cobrança
                        </Button>
                        <Button 
                            onClick={sendInvoiceToStudent}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Enviar por Email
                        </Button>
                    </DialogFooter>
                </div>
            )}
        </DialogContent>
    );
};

export default function FinancialsTab({ student, trainer, onUpdate }) {
    const [financials, setFinancials] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        payment_period: 'mensal',
        next_due_date: new Date(),
        status: 'ativo'
    });

    const fetchFinancials = async () => {
        try {
            const data = await StudentFinancials.filter({ 
                student_email: student.email, 
                trainer_email: trainer.email 
            });
            
            // Verificar se está atrasado
            if (data && data.next_due_date) {
                const isOverdue = new Date(data.next_due_date) < new Date();
                if (isOverdue && data.status === 'ativo') {
                    const updated = await StudentFinancials.update(data.id, { status: 'atrasado' });
                    setFinancials(updated);
                } else {
                    setFinancials(data);
                }
            } else {
                setFinancials(null);
            }
        } catch (error) {
            console.error('Erro ao buscar dados financeiros:', error);
            setFinancials(null);
        }
    };

    const fetchInvoices = async () => {
        try {
            const data = await Invoices.filter({ 
                student_email: student.email, 
                trainer_email: trainer.email 
            });
            setInvoices(data || []);
        } catch (error) {
            console.error('Erro ao buscar cobranças:', error);
            setInvoices([]);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await Promise.all([fetchFinancials(), fetchInvoices()]);
            setIsLoading(false);
        };
        loadData();
    }, [student.email, trainer.email]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = {
                student_email: student.email,
                trainer_email: trainer.email,
                amount: parseFloat(formData.amount),
                payment_period: formData.payment_period,
                next_due_date: format(formData.next_due_date, 'yyyy-MM-dd'),
                status: formData.status
            };

            if (financials) {
                await StudentFinancials.update(financials.id, dataToSave);
            } else {
                await StudentFinancials.create(dataToSave);
            }
            
            await fetchFinancials(); // Re-fetch to get latest data
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar dados financeiros: ' + error.message);
        }
    };

    const handleMarkAsPaid = async () => {
        if (!financials) return;
        
        try {
            await StudentFinancials.markAsPaid(financials.id, financials.payment_period);
            await fetchFinancials();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Erro ao marcar como pago:', error);
            alert('Erro ao marcar como pago: ' + error.message);
        }
    };

    const handleInvoiceGenerated = () => {
        fetchInvoices();
        setShowInvoiceDialog(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pendente': return 'text-yellow-600';
            case 'pago': return 'text-green-600';
            case 'atrasado': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Plano Financeiro */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Plano Financeiro
                    </CardTitle>
                    <CardDescription>
                        Configure o valor e período de pagamento do aluno
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!isEditing && financials && (
                        <div className="space-y-4">
                            {financials.status === 'atrasado' && (
                                <Alert className="bg-red-50 border-red-200">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertTitle className="text-red-800">Pagamento Atrasado!</AlertTitle>
                                    <AlertDescription className="text-red-700">
                                        O vencimento era em {format(new Date(financials.next_due_date), 'dd/MM/yyyy')}.
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><strong className="block text-gray-500">Valor</strong> R$ {financials.amount.toFixed(2)}</div>
                                <div><strong className="block text-gray-500">Período</strong> <span className="capitalize">{financials.payment_period}</span></div>
                                <div><strong className="block text-gray-500">Próximo Vencimento</strong> {format(new Date(financials.next_due_date), 'dd/MM/yyyy')}</div>
                            </div>
                            
                            <div className="flex gap-2">
                                <Button onClick={() => setIsEditing(true)}>Editar</Button>
                                <Button onClick={handleMarkAsPaid} variant="outline">Marcar como Pago</Button>
                                <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                                            <Receipt className="w-4 h-4 mr-2" />
                                            Gerar Cobrança
                                        </Button>
                                    </DialogTrigger>
                                    <GenerateInvoiceDialog 
                                        student={student}
                                        financials={financials}
                                        onInvoiceGenerated={handleInvoiceGenerated}
                                    />
                                </Dialog>
                            </div>
                        </div>
                    )}

                    {!isEditing && !financials && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">Nenhum plano financeiro configurado</p>
                            <Button onClick={() => setIsEditing(true)}>Configurar Plano</Button>
                        </div>
                    )}

                    {isEditing && (
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amount">Valor (R$)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        placeholder="0,00"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="payment_period">Período de Pagamento</Label>
                                    <Select 
                                        value={formData.payment_period} 
                                        onValueChange={(value) => setFormData({...formData, payment_period: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="semanal">Semanal</SelectItem>
                                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                                            <SelectItem value="mensal">Mensal</SelectItem>
                                            <SelectItem value="trimestral">Trimestral</SelectItem>
                                            <SelectItem value="semestral">Semestral</SelectItem>
                                            <SelectItem value="anual">Anual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            <div>
                                <Label>Próxima Data de Vencimento</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(formData.next_due_date, 'dd/MM/yyyy')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.next_due_date}
                                            onSelect={(date) => setFormData({...formData, next_due_date: date})}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">Salvar</Button>
                                {financials && <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>}
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>

            {/* Histórico de Cobranças */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Histórico de Cobranças
                    </CardTitle>
                    <CardDescription>
                        Todas as cobranças geradas para este aluno
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {invoices.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Número</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Vencimento</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data de Criação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                                        <TableCell>R$ {invoice.amount.toFixed(2)}</TableCell>
                                        <TableCell>{format(new Date(invoice.due_date), 'dd/MM/yyyy')}</TableCell>
                                        <TableCell>
                                            <span className={getStatusColor(invoice.status)}>
                                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell>{format(new Date(invoice.created_at), 'dd/MM/yyyy')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Nenhuma cobrança encontrada</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}