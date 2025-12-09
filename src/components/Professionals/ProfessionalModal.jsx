import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export const ProfessionalModal = ({ isOpen, onClose, onSave, editingProfessional }) => {
  const { isDark } = useTheme();
  const isEditing = !!editingProfessional;

  // Abas de permissões
  const [activePermissionTab, setActivePermissionTab] = useState('geral');

  const [formData, setFormData] = useState({
    email: '',
    tipo: 'dentista',
    nome: '',
    especialidade: '',
    cro: '',
    cpf: '',
    telefone: '',
    permissoes: {
      geral: {
        acessarAniversariantesRetornos: true,
        baixarListagemPacientes: true,
        acessarListagemPacientes: true,
      },
      prontuario: {},
      agenda: {},
      financeiro: {},
      configuracoes: {},
      exclusoes: {},
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (editingProfessional) {
        setFormData({
          email: editingProfessional.email || '',
          tipo: editingProfessional.tipo || 'dentista',
          nome: editingProfessional.nome || '',
          especialidade: editingProfessional.especialidade || '',
          cro: editingProfessional.cro || '',
          cpf: editingProfessional.cpf || '',
          telefone: editingProfessional.telefone || '',
          permissoes: editingProfessional.permissoes || {
            geral: {
              acessarAniversariantesRetornos: true,
              baixarListagemPacientes: true,
              acessarListagemPacientes: true,
            },
            prontuario: {},
            agenda: {},
            financeiro: {},
            configuracoes: {},
            exclusoes: {},
          }
        });
      } else {
        // Resetar formulário para novo profissional
        setFormData({
          email: '',
          tipo: 'dentista',
          nome: '',
          especialidade: '',
          cro: '',
          cpf: '',
          telefone: '',
          permissoes: {
            geral: {
              acessarAniversariantesRetornos: true,
              baixarListagemPacientes: true,
              acessarListagemPacientes: true,
            },
            prontuario: {},
            agenda: {},
            financeiro: {},
            configuracoes: {},
            exclusoes: {},
          }
        });
      }
    }
  }, [isOpen, editingProfessional]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return; // Nome é obrigatório
    }

    if (!formData.email.trim()) {
      return; // Email é obrigatório
    }

    const professionalData = {
      ...(isEditing && { id: editingProfessional.id }),
      email: formData.email.trim(),
      tipo: formData.tipo,
      nome: formData.nome.trim(),
      especialidade: formData.especialidade || null,
      cro: formData.cro || null,
      cpf: formData.cpf || null,
      telefone: formData.telefone || null,
      permissoes: formData.permissoes,
    };

    onSave(professionalData, isEditing);
    onClose();
  };

  // Máscaras
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCRO = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers;
  };

  const togglePermission = (category, key) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [category]: {
          ...prev.permissoes[category],
          [key]: !prev.permissoes[category][key]
        }
      }
    }));
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

  const permissionTabs = [
    { id: 'geral', label: 'Geral' },
    { id: 'prontuario', label: 'Prontuário' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'configuracoes', label: 'Configurações' },
    { id: 'exclusoes', label: 'Exclusões' },
  ];

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
            {isEditing ? 'Editar profissional' : 'Convidar profissional'}
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
            {/* Informações do Profissional */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Informações do Profissional
              </h3>
              
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className={labelClass}>Email do profissional</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com.br"
                    className={inputClass}
                    required
                  />
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Será enviado para este e-mail todas as instruções para acessar o Codental
                  </p>
                </div>

                {/* Tipo de Profissional */}
                <div>
                  <label className={labelClass}>Profissional</label>
                  <div className="relative">
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className={selectClass}
                    >
                      <option value="dentista">Dentista</option>
                      <option value="secretaria">Secretária(o)</option>
                    </select>
                    <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                </div>

                {/* Nome */}
                <div>
                  <label className={labelClass}>
                    <span className="text-red-500">*</span> Nome do profissional
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Leandro Martins"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Especialidade */}
                <div>
                  <label className={labelClass}>Especialidade</label>
                  <input
                    type="text"
                    value={formData.especialidade}
                    onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
                    placeholder="Ex: Ortodontista"
                    className={inputClass}
                  />
                </div>

                {/* CRO e CPF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>CRO</label>
                    <input
                      type="text"
                      value={formData.cro}
                      onChange={(e) => {
                        const formatted = formatCRO(e.target.value);
                        setFormData({ ...formData, cro: formatted });
                      }}
                      placeholder="00000"
                      className={inputClass}
                      maxLength={10}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>CPF</label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value);
                        setFormData({ ...formData, cpf: formatted });
                      }}
                      placeholder="000.000.000-00"
                      className={inputClass}
                      maxLength={14}
                    />
                  </div>
                </div>

                {/* Telefone */}
                <div>
                  <label className={labelClass}>Telefone</label>
                  <input
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setFormData({ ...formData, telefone: formatted });
                    }}
                    placeholder="(00) 00000-0000"
                    className={inputClass}
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Permissões */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Permissões
              </h3>

              {/* Tabs de Permissões */}
              <div className="mb-4">
                <div className="flex gap-1 border-b" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
                  {permissionTabs.map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActivePermissionTab(tab.id)}
                      className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                        activePermissionTab === tab.id
                          ? isDark 
                            ? 'text-blue-400' 
                            : 'text-blue-600'
                          : isDark 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      {activePermissionTab === tab.id && (
                        <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conteúdo das Permissões */}
              <div className="space-y-3">
                {activePermissionTab === 'geral' && (
                  <>
                    <PermissionToggle
                      label="Acessar as abas de &quot;Aniversariantes&quot; e &quot;Retornos semestrais&quot;"
                      checked={formData.permissoes.geral.acessarAniversariantesRetornos}
                      onChange={() => togglePermission('geral', 'acessarAniversariantesRetornos')}
                      isDark={isDark}
                    />
                    <PermissionToggle
                      label="Baixar listagem completa de pacientes"
                      checked={formData.permissoes.geral.baixarListagemPacientes}
                      onChange={() => togglePermission('geral', 'baixarListagemPacientes')}
                      isDark={isDark}
                    />
                    <PermissionToggle
                      label="Acessar listagem completa de pacientes"
                      checked={formData.permissoes.geral.acessarListagemPacientes}
                      onChange={() => togglePermission('geral', 'acessarListagemPacientes')}
                      isDark={isDark}
                    />
                  </>
                )}

                {activePermissionTab !== 'geral' && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Permissões para {permissionTabs.find(t => t.id === activePermissionTab)?.label.toLowerCase()} serão implementadas em breve.
                  </p>
                )}
              </div>
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
            {isEditing ? 'Salvar alterações' : 'Enviar convite'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para toggle de permissão
const PermissionToggle = ({ label, checked, onChange, isDark }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors ${
            checked
              ? 'bg-blue-500'
              : isDark
                ? 'bg-gray-700'
                : 'bg-gray-300'
          }`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} group-hover:${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
        {label}
      </span>
    </label>
  );
};
