
import React, { useState } from 'react';
import { Box, Card, Typography, Chip, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '700px',
    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  svgMap: {
    width: '100%',
    height: '100%',
  },
  cityPath: {
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
      filter: 'brightness(1.3)',
    },
  },
  tooltip: {
    position: 'absolute',
    background: 'rgba(0,0,0,0.95)',
    color: '#fff',
    padding: '16px 20px',
    borderRadius: '12px',
    pointerEvents: 'none',
    zIndex: 1000,
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
    border: '2px solid rgba(255,255,255,0.1)',
    minWidth: '220px',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    background: 'rgba(255,255,255,0.98)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  legendColor: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '2px solid #fff',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  },
  statsBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'rgba(255,255,255,0.98)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
  },
}));

interface CidadeFluxo {
  nome: string;
  documentos: number;
  receita: number;
  horaPico: string;
  tendencia: 'up' | 'down' | 'stable';
}

interface MapaSantaCatarinaProps {
  dados: CidadeFluxo[];
}

const MapaSantaCatarina: React.FC<MapaSantaCatarinaProps> = ({ dados }) => {
  const classes = useStyles();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; cidade: CidadeFluxo } | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const getColorByFluxo = (documentos: number): string => {
    if (documentos >= 100) return '#e74c3c';
    if (documentos >= 50) return '#e67e22';
    if (documentos >= 20) return '#f39c12';
    if (documentos >= 10) return '#3498db';
    return '#95a5a6';
  };

  const cidadesCoords = {
    'Florianópolis': { x: 520, y: 320 },
    'Joinville': { x: 480, y: 100 },
    'Blumenau': { x: 450, y: 200 },
    'São José': { x: 530, y: 330 },
    'Criciúma': { x: 500, y: 450 },
    'Chapecó': { x: 150, y: 200 },
    'Itajaí': { x: 470, y: 250 },
    'Jaraguá do Sul': { x: 460, y: 130 },
    'Lages': { x: 300, y: 280 },
    'Palhoça': { x: 525, y: 340 },
    'Tubarão': { x: 490, y: 410 },
    'Braço do Norte': { x: 470, y: 390 },
    'Içara': { x: 510, y: 460 },
    'Jaguaruna': { x: 530, y: 480 },
    'Orleans': { x: 450, y: 420 },
    'Araranguá': { x: 540, y: 500 },
    'Capivari de Baixo': { x: 495, y: 425 },
    'Nova Veneza': { x: 485, y: 455 },
    'Urussanga': { x: 475, y: 445 },
    'Cocal do Sul': { x: 505, y: 440 },
    'Laguna': { x: 520, y: 430 },
    'Morro da Fumaça': { x: 508, y: 445 },
  };

  const handleMouseMove = (e: React.MouseEvent, cidade: CidadeFluxo) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    setTooltip({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      cidade,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const handleCityClick = (cidade: string) => {
    setSelectedCity(selectedCity === cidade ? null : cidade);
  };

  const totalDocs = dados.reduce((sum, c) => sum + c.documentos, 0);
  const totalReceita = dados.reduce((sum, c) => sum + c.receita, 0);

  return (
    <Card className={classes.mapContainer}>
      <Box className={classes.statsBox}>
        <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: 12, color: '#1a4d3a' }}>
          📊 Visão Geral
        </Typography>
        <Typography variant="body2" style={{ marginBottom: 6 }}>
          <strong>{dados.length}</strong> cidades ativas
        </Typography>
        <Typography variant="body2" style={{ marginBottom: 6 }}>
          <strong>{totalDocs}</strong> documentos
        </Typography>
        <Typography variant="body2">
          <strong>R$ {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </Typography>
      </Box>

      <svg className={classes.svgMap} viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1a2332', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2a3442', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        <path
          d="M 50 150 Q 100 100, 200 120 T 400 100 Q 500 120, 550 200 L 560 350 Q 550 450, 500 520 L 400 540 Q 300 550, 200 520 L 100 450 Q 50 350, 60 250 Z"
          fill="url(#mapGradient)"
          stroke="#4a90e2"
          strokeWidth="3"
        />

        {dados.map((cidade) => {
          const coord = cidadesCoords[cidade.nome as keyof typeof cidadesCoords];
          if (!coord) return null;

          const raio = Math.max(10, Math.min(40, cidade.documentos / 2.5));
          const cor = getColorByFluxo(cidade.documentos);
          const isSelected = selectedCity === cidade.nome;

          return (
            <g key={cidade.nome} onClick={() => handleCityClick(cidade.nome)}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r={raio + 12}
                fill={cor}
                opacity={0.2}
              >
                <animate
                  attributeName="r"
                  from={raio + 12}
                  to={raio + 24}
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.3"
                  to="0"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
              
              <circle
                cx={coord.x}
                cy={coord.y}
                r={raio}
                fill={cor}
                opacity={isSelected ? 1 : 0.9}
                className={classes.cityPath}
                onMouseMove={(e) => handleMouseMove(e, cidade)}
                onMouseLeave={handleMouseLeave}
                filter={isSelected ? "url(#glow)" : undefined}
                stroke={isSelected ? '#fff' : cor}
                strokeWidth={isSelected ? 3 : 1}
              />
              
              <text
                x={coord.x}
                y={coord.y + raio + 16}
                textAnchor="middle"
                fill="#fff"
                fontSize="11"
                fontWeight="bold"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                {cidade.nome}
              </text>
              
              <text
                x={coord.x}
                y={coord.y + raio + 28}
                textAnchor="middle"
                fill="#4a90e2"
                fontSize="9"
                fontWeight="600"
              >
                {cidade.documentos} docs
              </text>
            </g>
          );
        })}
      </svg>

      {tooltip && (
        <Box
          className={classes.tooltip}
          style={{ left: tooltip.x + 15, top: tooltip.y - 60 }}
        >
          <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 8, fontSize: '15px' }}>
            📍 {tooltip.cidade.nome}
          </Typography>
          <Typography variant="caption" style={{ display: 'block', marginBottom: 4 }}>
            📊 <strong>{tooltip.cidade.documentos}</strong> documentos
          </Typography>
          <Typography variant="caption" style={{ display: 'block', marginBottom: 4 }}>
            💰 <strong>R$ {tooltip.cidade.receita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </Typography>
          <Typography variant="caption" style={{ display: 'block', marginBottom: 4 }}>
            ⏰ Pico: <strong>{tooltip.cidade.horaPico}</strong>
          </Typography>
          <Typography variant="caption" style={{ display: 'block' }}>
            📈 Tendência: <strong>{tooltip.cidade.tendencia === 'up' ? '🟢 Alta' : tooltip.cidade.tendencia === 'down' ? '🔴 Baixa' : '🟡 Estável'}</strong>
          </Typography>
        </Box>
      )}

      <Box className={classes.legend}>
        <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: '16px', fontSize: '0.95rem' }}>
          📊 Fluxo de Documentos
        </Typography>
        {[
          { label: 'Muito Alto (100+)', color: '#e74c3c' },
          { label: 'Alto (50-99)', color: '#e67e22' },
          { label: 'Médio (20-49)', color: '#f39c12' },
          { label: 'Baixo (10-19)', color: '#3498db' },
          { label: 'Muito Baixo (<10)', color: '#95a5a6' },
        ].map((item) => (
          <div key={item.label} className={classes.legendItem}>
            <div className={classes.legendColor} style={{ background: item.color }} />
            <Typography variant="caption" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.label}</Typography>
          </div>
        ))}
      </Box>
    </Card>
  );
};

export default MapaSantaCatarina;
