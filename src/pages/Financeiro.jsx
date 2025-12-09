import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LineChart } from '../components/Financeiro/LineChart';
import {
  CalendarIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

export default function Financeiro() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('painel');
  const [selectedMonth, setSelectedMonth] = useState('marco');
  const [selectedYear, setSelectedYear] = useState('2025');

  // Dados mockados - Visão Geral
  const visaoGeral = {
    entradas: {
      recebido: 1970.45,
      aReceber: 1847.50,
      totalPrevisto: 3817.95,
    },
    saidas: {
      pago: 1900.00,
      aPagar: 0.00,
      totalPrevisto: 1900.00,
    },
    resultados: {
      recebido: 70.45,
      aReceber: 1847.50,
      totalPrevisto: 1917.95,
    },
  };

  // Dados mockados - Cards
  const aguardandoRepasse = {
    valor: 2448.29,
    debitos: 10,
  };

  const inadimplencia = {
    valor: 223737.90,
    pacientes: 270,
  };

  const proximasDespesas = [
    { descricao: 'Equipamento de...', data: '10/06/2020', valor: 50.00 },
    { descricao: 'Salário Secretária', data: '10/06/2020', valor: 1200.00 },
    { descricao: 'Honorários', data: '17/06/2020', valor: 150.00 },
    { descricao: 'paciente 2', data: '09/04/2021', valor: 100.00 },
    { descricao: 'teste', data: '03/12/2021', valor: 15.00 },
    { descricao: 'teste', data: '14/02/2022', valor: 10.00 },
  ];

  // Dados mockados - Saúde da clínica
  const distribuicaoFaturamento = [
    { nome: 'Ismael Azevedo', percentual: 86, valor: 3382.78 },
    { nome: 'Tábata Oliveira', percentual: 14, valor: 540.00 },
  ];

  const formasPagamento = [
    { metodo: 'Crédito', percentual: 77, valor: 3020.30 },
    { metodo: 'Pix', percentual: 20, valor: 767.50 },
    { metodo: 'Dinheiro', percentual: 3, valor: 135.00 },
    { metodo: 'Débito', percentual: 0, valor: 0.00 },
    { metodo: 'Boleto', percentual: 0, valor: 0.00 },
    { metodo: 'Cheque', percentual: 0, valor: 0.00 },
    { metodo: 'TED', percentual: 0, valor: 0.00 },
  ];

  const tratamentosMaisRealizados = [
    { nome: 'Restauração em Resina Fotopolimerizável 1 face', percentual: 7, valor: 362.50 },
    { nome: 'Restauração em Resina Fotopolimerizável 3 faces', percentual: 3, valor: 149.98 },
    { nome: 'Restauração em Resina Fotopolimerizável 2 faces', percentual: 3, valor: 80.00 },
    { nome: 'Remoção de Corpo Estranho Intra-Canal', percentual: 2, valor: 460.00 },
    { nome: 'Ajuste Oclusal por Acréscimo', percentual: 2, valor: 160.00 },
  ];

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`;
  const cardClass = `rounded-lg border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Financeiro
          </h1>

          {/* Tabs */}
          <div className="flex gap-1 border-b" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <button
              onClick={() => setActiveTab('painel')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'painel'
                  ? isDark 
                    ? 'text-blue-400' 
                    : 'text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Painel
              {activeTab === 'painel' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('fluxo')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'fluxo'
                  ? isDark 
                    ? 'text-blue-400' 
                    : 'text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Fluxo de caixa
              {activeTab === 'fluxo' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
              )}
            </button>
            <button
              onClick={() => setActiveTab('boletos')}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'boletos'
                  ? isDark 
                    ? 'text-blue-400' 
                    : 'text-blue-600'
                  : isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Boletos
              {activeTab === 'boletos' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Conteúdo baseado na tab ativa */}
        {activeTab === 'painel' && (
          <div className="space-y-6">
            {/* Visão Geral */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Visão Geral
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      } appearance-none pr-8`}
                    >
                      <option value="janeiro">Janeiro</option>
                      <option value="fevereiro">Fevereiro</option>
                      <option value="marco">Março</option>
                      <option value="abril">Abril</option>
                      <option value="maio">Maio</option>
                      <option value="junho">Junho</option>
                      <option value="julho">Julho</option>
                      <option value="agosto">Agosto</option>
                      <option value="setembro">Setembro</option>
                      <option value="outubro">Outubro</option>
                      <option value="novembro">Novembro</option>
                      <option value="dezembro">Dezembro</option>
                    </select>
                    <ChevronDownIcon className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <div className="relative">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      } appearance-none pr-8`}
                    >
                      <option value="2023">2023</option>
                      <option value="2024">2024</option>
                      <option value="2025">2025</option>
                    </select>
                    <ChevronDownIcon className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Entradas */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Entradas
                    </h3>
                    <a href="#" className={`text-xs text-blue-500 hover:text-blue-600 ${isDark ? 'hover:text-blue-400' : ''}`}>
                      Ver detalhes
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recebido</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.entradas.recebido)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>A receber</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.entradas.aReceber)}
                      </p>
                    </div>
                    <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total previsto</p>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.entradas.totalPrevisto)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Saídas */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Saídas
                    </h3>
                    <a href="#" className={`text-xs text-blue-500 hover:text-blue-600 ${isDark ? 'hover:text-blue-400' : ''}`}>
                      Ver detalhes
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pago</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.saidas.pago)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>A pagar</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.saidas.aPagar)}
                      </p>
                    </div>
                    <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total previsto</p>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.saidas.totalPrevisto)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resultados */}
                <div>
                  <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Resultados
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Recebido</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.resultados.recebido)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>A receber</p>
                      <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.resultados.aReceber)}
                      </p>
                    </div>
                    <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total previsto</p>
                      <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(visaoGeral.resultados.totalPrevisto)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards menores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Aguardando repasse */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Aguardando repasse
                  </h3>
                  <a href="#" className={`text-xs text-blue-500 hover:text-blue-600 ${isDark ? 'hover:text-blue-400' : ''}`}>
                    Ver todos
                  </a>
                </div>
                <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(aguardandoRepasse.valor)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {aguardandoRepasse.debitos} débitos
                </p>
              </div>

              {/* Total de inadimplência */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total de inadimplência
                  </h3>
                  <a href="#" className={`text-xs text-blue-500 hover:text-blue-600 ${isDark ? 'hover:text-blue-400' : ''}`}>
                    Ver todos
                  </a>
                </div>
                <p className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(inadimplencia.valor)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {inadimplencia.pacientes} pacientes
                </p>
              </div>

              {/* Próximas despesas */}
              <div className={cardClass}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Próximas despesas
                  </h3>
                  <a href="#" className={`text-xs text-blue-500 hover:text-blue-600 ${isDark ? 'hover:text-blue-400' : ''}`}>
                    Ver todas
                  </a>
                </div>
                <div className="space-y-3">
                  {proximasDespesas.slice(0, 3).map((despesa, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {despesa.descricao}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {despesa.data}
                        </p>
                      </div>
                      <p className={`text-sm font-semibold ml-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(despesa.valor)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Saúde da clínica */}
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Saúde da clínica
                </h2>
                <div className="flex items-center gap-2">
                  <CalendarIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    1 de janeiro - 31 de março
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distribuição do faturamento */}
                <div>
                  <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Distribuição do faturamento
                  </h3>
                  <div className="space-y-4">
                    {distribuicaoFaturamento.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {item.nome}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(item.valor)}
                            </span>
                            <a href="#" className={`text-xs text-blue-500 hover:text-blue-600 ${isDark ? 'hover:text-blue-400' : ''}`}>
                              Ver
                            </a>
                          </div>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${item.percentual}%` }}
                          />
                        </div>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {item.percentual}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formas de pagamento */}
                <div>
                  <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Formas de pagamento
                  </h3>
                  <div className="space-y-3">
                    {formasPagamento.map((forma, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {forma.metodo}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {forma.percentual}%
                          </span>
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(forma.valor)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tratamentos mais realizados */}
                <div>
                  <h3 className={`text-sm font-medium mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Tratamentos mais realizados no período
                  </h3>
                  <div className="space-y-3">
                    {tratamentosMaisRealizados.map((tratamento, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {tratamento.nome}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {tratamento.percentual}%
                          </span>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatCurrency(tratamento.valor)}
                        </p>
                      </div>
                    ))}
                    <a href="#" className={`text-xs text-blue-500 hover:text-blue-600 block mt-4 ${isDark ? 'hover:text-blue-400' : ''}`}>
                      Ver todos
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="space-y-6">
              {/* Evolução do lucro líquido */}
              <LineChart
                title="Evolução do lucro líquido"
                data={Array(12).fill(0)}
                lines={[{
                  label: 'Lucro líquido',
                  color: '#10b981',
                  data: [28000, 25000, 27500, 26500, 31500, 28500, 32500, 33500, 32750, 36000, 36500, 37500]
                }]}
              />

              {/* Evolução da clínica */}
              <LineChart
                title="Evolução da clínica"
                subtitle="Relação entre entradas e saídas"
                data={Array(12).fill(0)}
                lines={[
                  {
                    label: 'Entradas',
                    color: '#10b981',
                    data: [27500, 24500, 27000, 29000, 31000, 28000, 31500, 33000, 31500, 35500, 35500, 36500]
                  },
                  {
                    label: 'Saídas',
                    color: '#ef4444',
                    data: [500, 500, 1000, 2500, 1000, 500, 500, 500, 500, 500, 500, 500]
                  }
                ]}
              />

              {/* Evolução do ticket médio */}
              <LineChart
                title="Evolução do ticket médio por paciente"
                data={Array(12).fill(0)}
                lines={[{
                  label: 'Ticket médio por paciente',
                  color: '#3b82f6',
                  data: [240, 225, 200, 210, 200, 208, 195, 225, 170, 195, 255, 215]
                }]}
              />

              {/* Relação entre orçamentos */}
              <LineChart
                title="Relação entre orçamentos cadastrados e orçamentos aprovados"
                data={Array(12).fill(0)}
                lines={[
                  {
                    label: 'Cadastrados',
                    color: '#10b981',
                    data: [23.5, 14.5, 11.5, 21.5, 20.5, 11.5, 27.5, 20.5, 28.5, 24.5, 21.5, 18.5]
                  },
                  {
                    label: 'Aprovados',
                    color: '#3b82f6',
                    data: [22.5, 11.5, 9.5, 18.5, 14.5, 7.5, 16.5, 13.5, 17.5, 17.5, 17.5, 11.5]
                  }
                ]}
              />
            </div>

            {/* Nota informativa */}
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              * Informações atualizadas a cada 30 minutos
            </p>
          </div>
        )}

        {activeTab === 'fluxo' && (
          <div className={cardClass}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Fluxo de caixa
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Em desenvolvimento...
            </p>
          </div>
        )}

        {activeTab === 'boletos' && (
          <div className={cardClass}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Boletos
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Em desenvolvimento...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}