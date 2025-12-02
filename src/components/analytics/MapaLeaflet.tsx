
import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, Typography, makeStyles, Tabs, Tab, Chip, Grid, Paper, LinearProgress, TextField, IconButton, ButtonGroup, Button } from '@material-ui/core';
import { TrendingUp, TrendingDown, Remove, LocationOn, AttachMoney, Assessment, Search, ZoomIn, ZoomOut, MyLocation, Fullscreen } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    minHeight: '500px',
    background: '#f5f7fa',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  mapElement: {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
  },
  header: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 1000,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  statsPanel: {
    position: 'absolute',
    top: 110,
    left: 12,
    zIndex: 1000,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    padding: theme.spacing(1.5),
    minWidth: 220,
    maxWidth: 240,
    maxHeight: '70%',
    overflowY: 'auto',
  },
  controlPanel: {
    position: 'absolute',
    top: 110,
    right: 12,
    zIndex: 1000,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    padding: theme.spacing(1),
  },
  searchBox: {
    position: 'absolute',
    top: 70,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '8px',
    padding: theme.spacing(1),
    minWidth: 300,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    background: 'rgba(255,255,255,0.95)',
    padding: theme.spacing(2),
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    fontSize: '0.85rem',
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  statCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: theme.spacing(1.5),
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
  },
  cityItem: {
    padding: theme.spacing(1),
    borderBottom: '1px solid #e0e0e0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#f5f5f5',
      transform: 'translateX(4px)',
    },
  },
}));

interface CidadeFluxo {
  nome: string;
  documentos: number;
  receita: number;
  latitude?: number;
  longitude?: number;
}

interface MapaLeafletProps {
  dados: CidadeFluxo[];
}

const MapaLeaflet: React.FC<MapaLeafletProps> = ({ dados }) => {
  const classes = useStyles();
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentZoom, setCurrentZoom] = useState(7);

  // Coordenadas expandidas - principais cidades do Brasil
  const coordenadasCidades: { [key: string]: [number, number] } = {
    // Santa Catarina
    'Florianópolis': [-27.5954, -48.5480],
    'Joinville': [-26.3045, -48.8487],
    'Blumenau': [-26.9194, -49.0661],
    'Criciúma': [-28.6773, -49.3694],
    'Tubarão': [-28.4669, -49.0069],
    'Braço do Norte': [-28.2756, -49.1644],
    'Içara': [-28.7144, -49.3019],
    'Jaguaruna': [-28.6147, -49.0256],
    'Orleans': [-28.3594, -49.2919],
    'Araranguá': [-28.9358, -49.4953],
    'Capivari de Baixo': [-28.4453, -48.9642],
    'Nova Veneza': [-28.6383, -49.4989],
    'Urussanga': [-28.5211, -49.3194],
    'Cocal do Sul': [-28.5978, -49.3269],
    'Laguna': [-28.4800, -48.7792],
    'Itajaí': [-26.9078, -48.6619],
    'Morro da Fumaça': [-28.6500, -49.2100],
    'São José': [-27.5969, -48.6334],
    'Palhoça': [-27.6453, -48.6702],
    'Chapecó': [-27.1004, -52.6156],
    'Jaraguá do Sul': [-26.4867, -49.0778],
    'Lages': [-27.8157, -50.3261],
    
    // Sul do Brasil
    'Porto Alegre': [-30.0346, -51.2177],
    'Curitiba': [-25.4284, -49.2733],
    'Caxias do Sul': [-29.1634, -51.1797],
    'Pelotas': [-31.7654, -52.3376],
    'Canoas': [-29.9177, -51.1844],
    'Londrina': [-23.3045, -51.1696],
    'Maringá': [-23.4205, -51.9333],
    'Ponta Grossa': [-25.0916, -50.1668],
    'Cascavel': [-24.9555, -53.4552],
    'Foz do Iguaçu': [-25.5469, -54.5882],
    
    // Sudeste
    'São Paulo': [-23.5505, -46.6333],
    'Rio de Janeiro': [-22.9068, -43.1729],
    'Belo Horizonte': [-19.9167, -43.9345],
    'Brasília': [-15.8267, -47.9218],
    'Campinas': [-22.9099, -47.0626],
    'Santos': [-23.9618, -46.3322],
    'Ribeirão Preto': [-21.1704, -47.8103],
    'Uberlândia': [-18.9188, -48.2766],
    'Sorocaba': [-23.5015, -47.4526],
    'São José dos Campos': [-23.1791, -45.8872],
    'Guarulhos': [-23.4538, -46.5333],
    'Osasco': [-23.5329, -46.7919],
    'Vitória': [-20.3155, -40.3128],
    
    // Nordeste
    'Salvador': [-12.9714, -38.5014],
    'Fortaleza': [-3.7319, -38.5267],
    'Recife': [-8.0476, -34.8770],
    'São Luís': [-2.5387, -44.2825],
    'Natal': [-5.7945, -35.2110],
    'Maceió': [-9.6662, -35.7350],
    'João Pessoa': [-7.1195, -34.8450],
    'Aracaju': [-10.9472, -37.0731],
    'Teresina': [-5.0892, -42.8016],
    'Feira de Santana': [-12.2664, -38.9663],
    
    // Norte
    'Manaus': [-3.1190, -60.0217],
    'Belém': [-1.4558, -48.5039],
    'Porto Velho': [-8.7612, -63.9004],
    'Rio Branco': [-9.9753, -67.8243],
    'Macapá': [0.0349, -51.0694],
    'Boa Vista': [2.8235, -60.6758],
    'Palmas': [-10.1689, -48.3317],
    
    // Centro-Oeste
    'Goiânia': [-16.6869, -49.2648],
    'Campo Grande': [-20.4697, -54.6201],
    'Cuiabá': [-15.6014, -56.0979],
  };

  const getColorByFluxo = (documentos: number): string => {
    if (documentos >= 100) return '#e74c3c';
    if (documentos >= 50) return '#e67e22';
    if (documentos >= 20) return '#3498db';
    if (documentos >= 10) return '#f39c12';
    return '#95a5a6';
  };

  const getTrendIcon = (documentos: number) => {
    if (documentos >= 50) return <TrendingUp style={{ fontSize: 14, color: '#27ae60' }} />;
    if (documentos >= 20) return <Remove style={{ fontSize: 14, color: '#f39c12' }} />;
    return <TrendingDown style={{ fontSize: 14, color: '#e74c3c' }} />;
  };

  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
    markersRef.current = [];
  };

  const totalDocumentos = dados.reduce((sum, c) => sum + c.documentos, 0);
  const totalReceita = dados.reduce((sum, c) => sum + c.receita, 0);
  const ticketMedio = totalReceita / totalDocumentos;
  const cidadesAtivas = dados.length;

  const filteredCidades = dados.filter(cidade => 
    cidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleFitBrazil = () => {
    if (mapRef.current) {
      mapRef.current.fitBounds([
        [-33.7, -73.9], // Sudoeste
        [5.3, -34.8]    // Nordeste
      ]);
    }
  };

  const handleFitSC = () => {
    if (mapRef.current) {
      mapRef.current.fitBounds([
        [-29.4, -54.0],
        [-25.9, -48.3]
      ]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let L: any = null;

    const initMap = async () => {
      try {
        if (typeof window === 'undefined') return;

        L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        if (!isMounted || !mapContainerRef.current) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        mapContainerRef.current.innerHTML = '';

        const map = L.map(mapContainerRef.current, {
          center: [-27.5, -49.5],
          zoom: 7,
          zoomControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          minZoom: 4,
          maxZoom: 18,
        });

        const tileLayers = [
          {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '© OpenStreetMap'
          },
          {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: '© Esri'
          },
          {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: '© OpenTopoMap'
          },
        ];

        L.tileLayer(tileLayers[activeTab].url, {
          attribution: tileLayers[activeTab].attribution,
          maxZoom: 18,
        }).addTo(map);

        map.on('zoomend', () => {
          setCurrentZoom(map.getZoom());
        });

        clearMarkers();

        dados.forEach(cidade => {
          const coords = coordenadasCidades[cidade.nome];
          if (!coords) return;

          const radius = Math.max(3000, Math.min(25000, cidade.documentos * 250));
          const color = getColorByFluxo(cidade.documentos);
          const participacao = ((cidade.receita / totalReceita) * 100).toFixed(1);
          const ticketCidade = cidade.receita / cidade.documentos;

          const circle = L.circle(coords, {
            color: color,
            fillColor: color,
            fillOpacity: 0.4,
            radius: radius,
            weight: 3,
          })
            .bindPopup(`
              <div style="padding: 16px; min-width: 300px; font-family: Arial, sans-serif;">
                <div style="border-bottom: 2px solid ${color}; padding-bottom: 12px; margin-bottom: 12px;">
                  <strong style="font-size: 18px; display: block; color: #333;">
                    📍 ${cidade.nome}
                  </strong>
                  <span style="font-size: 12px; color: #666; display: block; margin-top: 4px;">
                    Santa Catarina, Brasil
                  </span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                  <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                    <div style="font-size: 11px; color: #666; margin-bottom: 4px;">📊 Documentos</div>
                    <div style="font-size: 20px; font-weight: bold; color: ${color};">${cidade.documentos}</div>
                  </div>
                  <div style="background: #f8f9fa; padding: 10px; border-radius: 8px;">
                    <div style="font-size: 11px; color: #666; margin-bottom: 4px;">💰 Receita</div>
                    <div style="font-size: 16px; font-weight: bold; color: #27ae60;">R$ ${cidade.receita.toLocaleString('pt-BR')}</div>
                  </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 12px; border-radius: 8px; color: white; margin-bottom: 10px;">
                  <div style="font-size: 11px; opacity: 0.9; margin-bottom: 4px;">📈 Ticket Médio</div>
                  <div style="font-size: 18px; font-weight: bold;">R$ ${ticketCidade.toFixed(2)}</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f0f4ff; border-radius: 6px; margin-bottom: 8px;">
                  <span style="font-size: 12px; color: #555;">Participação Total</span>
                  <strong style="font-size: 14px; color: #667eea;">${participacao}%</strong>
                </div>
                
                <div style="background: #fff3cd; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                  <div style="font-size: 10px; color: #856404; margin-bottom: 2px;">📍 Coordenadas</div>
                  <div style="font-size: 11px; color: #856404; font-family: monospace;">${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}</div>
                </div>
                
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #888; text-align: center;">
                  🎯 ${cidade.documentos >= 50 ? 'Alto Potencial' : cidade.documentos >= 20 ? 'Potencial Médio' : 'Baixo Potencial'}
                </div>
              </div>
            `)
            .addTo(map);

          const icon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: ${color}; 
                width: 24px; 
                height: 24px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: 11px;
              ">
                ${cidade.documentos}
                <div style="
                  position: absolute;
                  top: -12px;
                  left: -12px;
                  width: 48px;
                  height: 48px;
                  border-radius: 50%;
                  background: ${color};
                  opacity: 0.3;
                  animation: pulse 2s infinite;
                "></div>
              </div>
              <style>
                @keyframes pulse {
                  0% { transform: scale(0.8); opacity: 0.5; }
                  50% { transform: scale(1.3); opacity: 0.2; }
                  100% { transform: scale(0.8); opacity: 0.5; }
                }
              </style>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker(coords, { icon })
            .bindPopup(`<strong>${cidade.nome}</strong><br/>${cidade.documentos} documentos`)
            .addTo(map);

          marker.on('click', () => {
            setSelectedCity(cidade.nome);
          });

          markersRef.current.push(circle, marker);
        });

        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        mapRef.current = map;
        setIsLoaded(true);
      } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      clearMarkers();
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {
          console.warn('Erro ao limpar mapa:', e);
        }
      }
    };
  }, [dados, activeTab]);

  const handleCityClick = (cidade: CidadeFluxo) => {
    setSelectedCity(cidade.nome);
    const coords = coordenadasCidades[cidade.nome];
    if (coords && mapRef.current) {
      mapRef.current.setView(coords, 12);
    }
  };

  return (
    <Card className={classes.mapContainer}>
      <Box className={classes.header}>
        <Tabs 
          value={activeTab} 
          onChange={(e, v) => setActiveTab(v)} 
          variant="fullWidth"
          indicatorColor="primary"
        >
          <Tab label="🗺️ Mapa Padrão" />
          <Tab label="🛰️ Satélite" />
          <Tab label="⛰️ Topográfico" />
        </Tabs>
      </Box>

      <Box className={classes.searchBox}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search style={{ marginRight: 8, color: '#666' }} />,
          }}
        />
      </Box>

      {isLoaded && (
        <>
          <Box className={classes.statsPanel}>
            <Typography variant="h6" style={{ fontWeight: 'bold', marginBottom: 16, color: '#333' }}>
              📊 Visão Geral
            </Typography>

            <Paper className={classes.statCard} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Typography style={{ fontSize: '0.65rem', opacity: 0.9 }}>Cidades</Typography>
              <Typography variant="h6" style={{ fontWeight: 'bold' }}>{cidadesAtivas}</Typography>
            </Paper>

            <Paper className={classes.statCard} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <Typography style={{ fontSize: '0.65rem', opacity: 0.9 }}>Documentos</Typography>
              <Typography variant="h6" style={{ fontWeight: 'bold' }}>{totalDocumentos}</Typography>
            </Paper>

            <Paper className={classes.statCard} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <Typography style={{ fontSize: '0.65rem', opacity: 0.9 }}>Receita</Typography>
              <Typography style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                R$ {totalReceita.toLocaleString('pt-BR')}
              </Typography>
            </Paper>

            <Paper className={classes.statCard} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <Typography style={{ fontSize: '0.65rem', opacity: 0.9 }}>Ticket Médio</Typography>
              <Typography style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                R$ {ticketMedio.toFixed(2)}
              </Typography>
            </Paper>

            <Box mt={2} mb={1}>
              <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                🏙️ {searchTerm ? 'Resultados' : 'Top Cidades'}
              </Typography>
            </Box>

            {filteredCidades.slice(0, 10).map((cidade, index) => {
              const color = getColorByFluxo(cidade.documentos);
              const participacao = ((cidade.receita / totalReceita) * 100).toFixed(1);
              
              return (
                <Box 
                  key={cidade.nome} 
                  className={classes.cityItem}
                  onClick={() => handleCityClick(cidade)}
                  style={{
                    background: selectedCity === cidade.nome ? '#e3f2fd' : 'transparent',
                    borderLeft: `4px solid ${color}`,
                    paddingLeft: 12,
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box flex={1}>
                      <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 2 }}>
                        {index + 1}. {cidade.nome}
                      </Typography>
                      <Box display="flex" style={{ gap:"8px" }} alignItems="center">
                        <Chip 
                          label={`${cidade.documentos} docs`} 
                          size="small" 
                          style={{ 
                            background: color, 
                            color: '#fff', 
                            fontSize: '0.7rem',
                            height: 20 
                          }} 
                        />
                        <Typography variant="caption" style={{ color: '#666' }}>
                          {participacao}%
                        </Typography>
                      </Box>
                    </Box>
                    {getTrendIcon(cidade.documentos)}
                  </Box>
                  <Box mt={0.5}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(cidade.receita / totalReceita) * 100} 
                      style={{ height: 4, borderRadius: 2, background: '#e0e0e0' }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box className={classes.controlPanel}>
            <Typography variant="caption" style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
              Zoom: {currentZoom}
            </Typography>
            <ButtonGroup orientation="vertical" size="small">
              <Button onClick={handleZoomIn} startIcon={<ZoomIn />}>
                Zoom +
              </Button>
              <Button onClick={handleZoomOut} startIcon={<ZoomOut />}>
                Zoom -
              </Button>
              <Button onClick={handleFitSC} startIcon={<MyLocation />}>
                SC
              </Button>
              <Button onClick={handleFitBrazil} startIcon={<Fullscreen />}>
                Brasil
              </Button>
            </ButtonGroup>
          </Box>
        </>
      )}
      
      <div ref={mapContainerRef} className={classes.mapElement} />

      {isLoaded && (
        <Box className={classes.legend}>
          <Typography variant="subtitle2" style={{ fontWeight: 'bold', marginBottom: 12 }}>
            📊 Fluxo de Documentos
          </Typography>
          {[
            { label: 'Muito Alto (100+)', color: '#e74c3c' },
            { label: 'Alto (50-99)', color: '#e67e22' },
            { label: 'Médio (20-49)', color: '#3498db' },
            { label: 'Baixo (10-19)', color: '#f39c12' },
            { label: 'Muito Baixo (<10)', color: '#95a5a6' },
          ].map((item) => (
            <div key={item.label} className={classes.legendItem}>
              <div className={classes.legendColor} style={{ background: item.color }} />
              <Typography variant="caption">{item.label}</Typography>
            </div>
          ))}
          <Box mt={2} display="flex" style={{ gap:"4px" }}flexWrap="wrap">
            <Chip 
              label={`${cidadesAtivas} cidades`} 
              size="small" 
              color="primary" 
              style={{ fontSize: '0.7rem' }}
            />
            <Chip 
              label={`${totalDocumentos} docs`} 
              size="small" 
              style={{ fontSize: '0.7rem', background: '#f39c12', color: '#fff' }}
            />
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default MapaLeaflet;
