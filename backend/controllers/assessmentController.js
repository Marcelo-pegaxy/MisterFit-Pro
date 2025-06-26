const supabase = require('../config/supabaseClient');

const getAssessmentsByStudent = async (req, res) => {
    const { studentId } = req.params;

    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .eq('student_id', studentId);

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAssessment = async (req, res) => {
    try {
        const data = req.body;
        // Salva todos os campos enviados
        const { data: created, error } = await supabase
            .from('assessments')
            .insert([data])
            .select()
            .single();
        if (error) throw error;
        res.status(201).json({ message: 'Avaliação criada!', data: created });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ message: 'Erro ao criar avaliação', error: error?.message });
    }
};

exports.getAssessments = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*');
        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar avaliações', error: error?.message });
    }
};

exports.getAssessmentsByStudent = async (req, res) => {
    const { studentId } = req.params;

    try {
        const { data, error } = await supabase
            .from('assessments')
            .select('*')
            .or(`student_id.eq.${studentId},aluno_id.eq.${studentId}`);

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};