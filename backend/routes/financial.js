const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const { protect } = require('../middleware/auth');

// Rotas para planos financeiros
router.get('/plans', protect, financialController.getFinancialPlan);
router.post('/plans', protect, financialController.upsertFinancialPlan);
router.put('/plans/:id/mark-paid', protect, financialController.markAsPaid);

// Rotas para cobranças
router.get('/invoices', protect, financialController.getInvoices);
router.post('/invoices', protect, financialController.createInvoice);
router.put('/invoices/:id/status', protect, financialController.updateInvoiceStatus);

// Rotas para estatísticas
router.get('/stats', protect, financialController.getFinancialStats);

module.exports = router; 