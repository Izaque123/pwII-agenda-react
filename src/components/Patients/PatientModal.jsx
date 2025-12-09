import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

export const PatientModal = ({ isOpen, onClose, onSave, editingPatient }) => {
  const { isDark } = useTheme();
  const isEditing = !!editingPatient;

  const [formData, setFormData] = useState({
    nome: '',
    celular: '',
    lembretesAutomaticos: 'whatsapp',
    email: '',
    telefoneFixo: '',
    comoConheceu: '',
    profissao: '',
    genero: '',
    pacienteEstrangeiro: false,
    dataNascimento: '',
    cpf: '',
    rg: '',
    observacoes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (editingPatient) {
        setFormData({
          nome: editingPatient.nome || '',
          celular: editingPatient.celular || editingPatient.telefone || '',
          lembretesAutomaticos: editingPatient.lembretesAutomaticos || 'whatsapp',
          email: editingPatient.email || '',
          telefoneFixo: editingPatient.telefoneFixo || '',
          comoConheceu: editingPatient.comoConheceu || '',
          profissao: editingPatient.profissao || '',
          genero: editingPatient.genero || '',
          pacienteEstrangeiro: editingPatient.pacienteEstrangeiro || false,
          dataNascimento: editingPatient.dataNascimento 
            ? new Date(editingPatient.dataNascimento).toISOString().split('T')[0]
            : '',
          cpf: editingPatient.cpf || '',
          rg: editingPatient.rg || '',
          observacoes: editingPatient.observacoes || '',
        });
      } else {
        // Resetar formulário para novo paciente
        setFormData({
          nome: '',
          celular: '',
          lembretesAutomaticos: 'whatsapp',
          email: '',
          telefoneFixo: '',
          comoConheceu: '',
          profissao: '',
          genero: '',
          pacienteEstrangeiro: false,
          dataNascimento: '',
          cpf: '',
          rg: '',
          observacoes: '',
        });
      }
    }
  }, [isOpen, editingPatient]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return; // Nome é obrigatório
    }

    const pacienteData = {
      ...(isEditing && { id: editingPatient.id }),
      nome: formData.nome.trim(),
      celular: formData.celular || null,
      telefone: formData.celular || null, // Para compatibilidade
      lembretesAutomaticos: formData.lembretesAutomaticos,
      email: formData.email || null,
      telefoneFixo: formData.telefoneFixo || null,
      comoConheceu: formData.comoConheceu || null,
      profissao: formData.profissao || null,
      genero: formData.genero || null,
      pacienteEstrangeiro: formData.pacienteEstrangeiro || false,
      dataNascimento: formData.dataNascimento ? new Date(formData.dataNascimento).toISOString() : null,
      cpf: formData.cpf || null,
      rg: formData.rg || null,
      observacoes: formData.observacoes || null,
      ...(isEditing && { dataCadastro: editingPatient.dataCadastro }),
      ...(isEditing && { status: editingPatient.status }),
      ...(!isEditing && { status: 'ativo' }),
    };

    onSave(pacienteData, isEditing);
    onClose();
  };

  // Máscaras para telefone e CPF
  const formatPhone = (value, isFixo = false) => {
    const numbers = value.replace(/\D/g, '');
    if (isFixo) {
      // Telefone fixo: (00) 0000-0000
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Celular: (00) 00000-0000
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handlePhoneChange = (field, value) => {
    const formatted = formatPhone(value);
    setFormData({ ...formData, [field]: formatted });
  };

  const handleCPFChange = (value) => {
    const formatted = formatCPF(value);
    setFormData({ ...formData, cpf: formatted });
  };

  if (!isOpen) return null;

  const inputClass = `w-full px-3 py-2.5 rounded-lg border text-sm transition-all ${
    isDark 
      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  } outline-none`;

  const selectClass = `w-full px-3 py-2.5 rounded-lg border text-sm appearance-none cursor-pointer transition-all ${
    isDark 
      ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
      : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
  } outline-none`;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative max-w-4xl w-full rounded-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isEditing ? 'Editar paciente' : 'Cadastrar novo paciente'}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* Nome completo */}
            <div>
              <label className={labelClass}>
                <span className="text-red-500">*</span> Nome completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome completo"
                  className={inputClass}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    type="button"
                    className={`p-1 rounded-full ${isDark ? 'text-gray-500 hover:bg-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}
                    title="Bloqueado"
                  >
                    <LockClosedIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className={`p-1 rounded-full ${isDark ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-500 hover:bg-gray-100'}`}
                    title="Informações"
                  >
                    <InformationCircleIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Informações de contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Celular */}
              <div>
                <label className={labelClass}>Celular</label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="text-xs">🇧🇷</span>
                    <span className="text-xs">+55</span>
                  </div>
                  <input
                    type="text"
                    value={formData.celular}
                    onChange={(e) => handlePhoneChange('celular', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={`${inputClass} pl-16`}
                    maxLength={15}
                  />
                </div>
              </div>

              {/* Lembretes automáticos */}
              <div>
                <label className={labelClass}>Lembretes automáticos</label>
                <div className="relative">
                  <select
                    value={formData.lembretesAutomaticos}
                    onChange={(e) => setFormData({ ...formData, lembretesAutomaticos: e.target.value })}
                    className={selectClass}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="nenhum">Nenhum</option>
                  </select>
                  <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className={inputClass}
                />
              </div>

              {/* Telefone fixo */}
              <div>
                <label className={labelClass}>Telefone fixo</label>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="text-xs">🇧🇷</span>
                    <span className="text-xs">+55</span>
                  </div>
                  <input
                    type="text"
                    value={formData.telefoneFixo}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value, true);
                      setFormData({ ...formData, telefoneFixo: formatted });
                    }}
                    placeholder="(00) 0000-0000"
                    className={`${inputClass} pl-16`}
                    maxLength={14}
                  />
                </div>
              </div>
            </div>

            {/* Informações demográficas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Como conheceu a clínica */}
              <div>
                <label className={labelClass}>Como conheceu a clínica</label>
                <div className="relative">
                  <select
                    value={formData.comoConheceu}
                    onChange={(e) => setFormData({ ...formData, comoConheceu: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Selecione...</option>
                    <option value="indicacao">Indicação</option>
                    <option value="google">Google</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="outro">Outro</option>
                  </select>
                  <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>

              {/* Profissão */}
              <div>
                <label className={labelClass}>Profissão</label>
                <input
                  type="text"
                  value={formData.profissao}
                  onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
                  placeholder="Digite a profissão"
                  className={inputClass}
                />
              </div>

              {/* Gênero */}
              <div>
                <label className={labelClass}>Gênero</label>
                <div className="relative">
                  <select
                    value={formData.genero}
                    onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                    className={selectClass}
                  >
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                    <option value="prefiro-nao-informar">Prefiro não informar</option>
                  </select>
                  <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>
            </div>

            {/* Paciente estrangeiro, Data de nascimento, CPF, RG */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Paciente estrangeiro */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pacienteEstrangeiro}
                    onChange={(e) => setFormData({ ...formData, pacienteEstrangeiro: e.target.checked })}
                    className={`w-4 h-4 rounded border-2 ${
                      formData.pacienteEstrangeiro
                        ? 'border-blue-500 bg-blue-500'
                        : isDark ? 'border-gray-600' : 'border-gray-300'
                    }`}
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Paciente estrangeiro
                  </span>
                </label>
              </div>

              {/* Data de nascimento */}
              <div>
                <label className={labelClass}>Data de nascimento</label>
                <input
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                  className={inputClass}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* CPF */}
              <div>
                <label className={labelClass}>CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleCPFChange(e.target.value)}
                  placeholder="000.000.000-00"
                  className={inputClass}
                  maxLength={14}
                  disabled={formData.pacienteEstrangeiro}
                />
              </div>

              {/* RG */}
              <div>
                <label className={labelClass}>RG</label>
                <input
                  type="text"
                  value={formData.rg}
                  onChange={(e) => setFormData({ ...formData, rg: e.target.value.replace(/\D/g, '') })}
                  placeholder="Digite o RG"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className={labelClass}>Adicionar observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Adicione observações sobre o paciente"
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              isDark 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <CheckIcon className="w-4 h-4" />
            {isEditing ? 'Salvar alterações' : 'Cadastrar paciente'}
          </button>
        </div>
      </div>
    </div>
  );
};

