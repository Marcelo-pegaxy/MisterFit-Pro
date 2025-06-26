const supabase = require('../config/supabaseClient');

// Listar conversas do usuário logado (distintos por email)
exports.getConversations = async (req, res) => {
  const userEmail = req.user.email;
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('sender_email, receiver_email')
      .or(`sender_email.eq.${userEmail},receiver_email.eq.${userEmail}`);
    if (error) throw error;
    const contacts = new Set();
    data.forEach(msg => {
      if (msg.sender_email !== userEmail) contacts.add(msg.sender_email);
      if (msg.receiver_email !== userEmail) contacts.add(msg.receiver_email);
    });
    res.json(Array.from(contacts));
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar conversas', error: error?.message });
  }
};

// Listar mensagens entre usuário logado e outro contato
exports.getMessages = async (req, res) => {
  const userEmail = req.user.email;
  const { with: contactEmail } = req.query;
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_email.eq.${userEmail},receiver_email.eq.${contactEmail}),and(sender_email.eq.${contactEmail},receiver_email.eq.${userEmail})`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar mensagens', error: error?.message });
  }
};

// Enviar mensagem
exports.sendMessage = async (req, res) => {
  const sender_email = req.user.email;
  const { receiver_email, content } = req.body;
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_email, receiver_email, content }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao enviar mensagem', error: error?.message });
  }
};

// Marcar mensagens como lidas
exports.markAsRead = async (req, res) => {
  const userEmail = req.user.email;
  const { with: contactEmail } = req.body;
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_email', contactEmail)
      .eq('receiver_email', userEmail)
      .eq('is_read', false);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao marcar mensagens como lidas', error: error?.message });
  }
};

// Conta mensagens não lidas para o usuário logado
exports.getUnreadCount = async (req, res) => {
  const userEmail = req.user.email;
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_email', userEmail)
      .eq('is_read', false);
    if (error) throw error;
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao contar mensagens não lidas', error: error?.message });
  }
}; 