import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const LineChart = ({ title, subtitle, data, lines, height = 300 }) => {
  const { isDark } = useTheme();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: 'top' });
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);
  
  if (!data || data.length === 0) return null;

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Calcular valores mínimos e máximos para escala
  const allValues = lines.flatMap(line => line.data);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;
  const padding = range > 0 ? range * 0.15 : maxValue * 0.15 || 1; // 15% de padding
  
  const chartMin = Math.max(0, minValue - padding);
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin || 1; // Evitar divisão por zero

  // Dimensões do gráfico
  const width = 800;
  const chartHeight = height - 80;
  const margin = { top: 30, right: 50, bottom: 50, left: 70 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeightInner = chartHeight - margin.top - margin.bottom;

  // Função para converter valor em coordenada Y
  const getY = (value) => {
    const normalized = (value - chartMin) / chartRange;
    return margin.top + chartHeightInner - (normalized * chartHeightInner);
  };

  // Função para converter índice em coordenada X
  const getX = (index) => {
    const divisor = data.length > 1 ? data.length - 1 : 1;
    return margin.left + (index / divisor) * chartWidth;
  };

  // Gerar pontos da linha que passa exatamente pelos pontos de dados
  const generatePath = (lineData) => {
    if (lineData.length === 0) return '';
    
    // Linha que conecta os pontos diretamente - garante alinhamento perfeito
    const points = lineData.map((value, index) => {
      const x = getX(index);
      const y = getY(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    
    return points.join(' ');
  };

  // Gerar área preenchida
  const generateAreaPath = (lineData) => {
    if (lineData.length === 0) return '';
    
    const linePath = generatePath(lineData);
    const firstX = getX(0);
    const lastX = getX(lineData.length - 1);
    const baseY = getY(chartMin);
    
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  // Gerar valores do eixo Y
  const yTicks = 5;
  const yTickValues = [];
  for (let i = 0; i <= yTicks; i++) {
    yTickValues.push(chartMin + (chartRange / yTicks) * i);
  }

  // Formatar valor para exibição
  const formatValue = (value) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${Math.round(value).toLocaleString('pt-BR')}`;
  };

  // Calcular posição do tooltip para ficar sempre visível
  useEffect(() => {
    if (!hoveredPoint || !containerRef.current) {
      setTooltipPosition({ x: 0, y: 0, placement: 'top' });
      return;
    }

    const calculatePosition = () => {
      if (!tooltipRef.current || !containerRef.current) return;
      
      const tooltip = tooltipRef.current;
      const container = containerRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      // Posição do ponto em pixels relativos ao container
      const pointX = (hoveredPoint.x / width) * containerRect.width;
      const pointY = (hoveredPoint.y / height) * containerRect.height;
      
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;
      const padding = 12;
      const offset = 8; // Distância do ponto
      
      // Calcular posição X (centralizar, mas respeitando bordas)
      let x = pointX;
      const halfWidth = tooltipWidth / 2;
      if (x - halfWidth < padding) {
        x = halfWidth + padding;
      } else if (x + halfWidth > containerRect.width - padding) {
        x = containerRect.width - halfWidth - padding;
      }
      
      // Calcular posição Y e placement
      let y = pointY;
      let placement = 'top';
      
      // Verificar espaço acima
      const spaceAbove = pointY;
      const spaceBelow = containerRect.height - pointY;
      
      if (spaceAbove >= tooltipHeight + offset + padding) {
        // Cabe acima
        y = pointY - offset;
        placement = 'top';
      } else if (spaceBelow >= tooltipHeight + offset + padding) {
        // Cabe abaixo
        y = pointY + offset;
        placement = 'bottom';
      } else {
        // Não cabe nem acima nem abaixo, centralizar verticalmente
        y = Math.max(
          padding, 
          Math.min(
            containerRect.height - tooltipHeight - padding, 
            pointY - tooltipHeight / 2
          )
        );
        placement = 'top';
      }
      
      setTooltipPosition({ x, y, placement });
    };

    // Aguardar o próximo frame para o tooltip ser renderizado
    const timeoutId = setTimeout(calculatePosition, 0);
    
    return () => clearTimeout(timeoutId);
  }, [hoveredPoint, width, height]);

  return (
    <div className={`rounded-xl border shadow-lg overflow-hidden transition-all duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-gray-900/50' 
        : 'bg-white border-gray-200 shadow-gray-200/50'
    }`}>
      {/* Header com gradiente sutil */}
      <div className={`px-6 pt-6 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        {subtitle && (
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="p-6">
        <div ref={containerRef} className="overflow-x-auto -mx-2 px-2 relative">
          <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full"
            style={{ minHeight: `${height}px` }}
          >
            {/* Definições de gradientes */}
            <defs>
              {lines.map((line, lineIndex) => {
                const color = line.color || '#3b82f6';
                return (
                  <linearGradient
                    key={`gradient-${lineIndex}`}
                    id={`gradient-${lineIndex}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                  </linearGradient>
                );
              })}
              
              {/* Filtro de sombra para as linhas */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid horizontal sutil */}
            {yTickValues.map((value, index) => {
              const y = getY(value);
              return (
                <line
                  key={`grid-h-${index}`}
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke={isDark ? '#374151' : '#f3f4f6'}
                  strokeWidth={1}
                  opacity={0.5}
                />
              );
            })}

            {/* Áreas preenchidas com gradiente */}
            {lines.map((line, lineIndex) => (
              <path
                key={`area-${lineIndex}`}
                d={generateAreaPath(line.data)}
                fill={`url(#gradient-${lineIndex})`}
                opacity={0.6}
              />
            ))}

            {/* Linhas do gráfico com efeito glow */}
            {lines.map((line, lineIndex) => {
              const color = line.color || '#3b82f6';
              return (
                <g key={`line-${lineIndex}`}>
                  {/* Linha com sombra */}
                  <path
                    d={generatePath(line.data)}
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.3}
                    filter="url(#glow)"
                  />
                  {/* Linha principal */}
                  <path
                    d={generatePath(line.data)}
                    fill="none"
                    stroke={color}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  
                  {/* Marcadores com hover */}
                  {line.data.map((value, index) => {
                    const x = getX(index);
                    const y = getY(value);
                    const isHovered = hoveredPoint?.lineIndex === lineIndex && hoveredPoint?.pointIndex === index;
                    
                    return (
                      <g key={`point-group-${lineIndex}-${index}`}>
                        {/* Círculo externo animado */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 8 : 6}
                          fill={color}
                          opacity={isHovered ? 0.2 : 0}
                          className="transition-all duration-200"
                        />
                        {/* Círculo principal */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 6 : 5}
                          fill={color}
                          stroke={isDark ? '#111827' : '#ffffff'}
                          strokeWidth={isHovered ? 3 : 2}
                          className="transition-all duration-200 cursor-pointer"
                          onMouseEnter={() => {
                            setHoveredPoint({ 
                              lineIndex, 
                              pointIndex: index, 
                              value, 
                              month: months[index] || `M${index + 1}`, 
                              label: line.label,
                              x: getX(index),
                              y: getY(value)
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredPoint(null);
                          }}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Linha vertical no hover */}
            {hoveredPoint && (
              <line
                x1={getX(hoveredPoint.pointIndex)}
                y1={margin.top}
                x2={getX(hoveredPoint.pointIndex)}
                y2={chartHeight - margin.bottom}
                stroke={isDark ? '#4b5563' : '#d1d5db'}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                opacity={0.6}
              />
            )}

            {/* Eixo Y com estilo moderno */}
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={chartHeight - margin.bottom}
              stroke={isDark ? '#4b5563' : '#d1d5db'}
              strokeWidth={2}
            />

            {/* Labels do eixo Y com melhor formatação */}
            {yTickValues.map((value, index) => {
              const y = getY(value);
              return (
                <g key={`y-label-${index}`}>
                  <text
                    x={margin.left - 15}
                    y={y + 5}
                    textAnchor="end"
                    fill={isDark ? '#9ca3af' : '#6b7280'}
                    fontSize="11"
                    fontWeight="500"
                    className="font-medium"
                  >
                    {formatValue(value)}
                  </text>
                </g>
              );
            })}

            {/* Eixo X com estilo moderno */}
            <line
              x1={margin.left}
              y1={chartHeight - margin.bottom}
              x2={width - margin.right}
              y2={chartHeight - margin.bottom}
              stroke={isDark ? '#4b5563' : '#d1d5db'}
              strokeWidth={2}
            />

            {/* Labels do eixo X com melhor estilo */}
            {data.map((_, index) => {
              const x = getX(index);
              return (
                <text
                  key={`x-label-${index}`}
                  x={x}
                  y={chartHeight - margin.bottom + 25}
                  textAnchor="middle"
                  fill={isDark ? '#9ca3af' : '#6b7280'}
                  fontSize="12"
                  fontWeight="500"
                  className="font-medium"
                >
                  {months[index] || `M${index + 1}`}
                </text>
              );
            })}
          </svg>
          
          {/* Tooltip flutuante */}
          {hoveredPoint && (
            <div 
              ref={tooltipRef}
              className={`absolute z-50 px-4 py-2.5 rounded-xl shadow-2xl border pointer-events-none backdrop-blur-sm whitespace-nowrap ${
                isDark 
                  ? 'bg-gray-800/95 border-gray-700 text-white' 
                  : 'bg-white/95 border-gray-200 text-gray-900'
              }`}
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: tooltipPosition.placement === 'top' 
                  ? 'translate(-50%, -100%)' 
                  : 'translate(-50%, 0)',
                marginTop: tooltipPosition.placement === 'top' ? '-8px' : '8px',
              }}
            >
              <div className={`text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {hoveredPoint.label}
              </div>
              <div className={`text-base font-bold mb-1`} style={{ color: lines[hoveredPoint.lineIndex]?.color || '#3b82f6' }}>
                {formatValue(hoveredPoint.value)}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {hoveredPoint.month}
              </div>
              {/* Seta do tooltip - posição dinâmica */}
              <div 
                className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
                  tooltipPosition.placement === 'top'
                    ? 'bottom-0 translate-y-1/2'
                    : 'top-0 -translate-y-1/2'
                } ${
                  isDark ? 'bg-gray-800 border-r border-b border-gray-700' : 'bg-white border-r border-b border-gray-200'
                }`}
                style={{
                  borderColor: tooltipPosition.placement === 'top'
                    ? (isDark ? '#374151' : '#e5e7eb')
                    : 'transparent',
                  borderRightColor: tooltipPosition.placement === 'top' ? 'transparent' : (isDark ? '#374151' : '#e5e7eb'),
                  borderBottomColor: tooltipPosition.placement === 'top' ? 'transparent' : (isDark ? '#374151' : '#e5e7eb'),
                  borderTopColor: tooltipPosition.placement === 'top' ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
                  borderLeftColor: tooltipPosition.placement === 'top' ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
                }}
              />
            </div>
          )}
        </div>

        {/* Legenda moderna */}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          {lines.map((line, index) => {
            const color = line.color || '#3b82f6';
            return (
              <div 
                key={index} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  isDark 
                    ? 'hover:bg-gray-700' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 8px ${color}40`
                  }}
                />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {line.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

