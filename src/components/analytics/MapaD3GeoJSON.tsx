import React from 'react';
import { Box, Card, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Map as MapIcon } from '@material-ui/icons';

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
  controls: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  controlButton: {
    background: 'rgba(255,255,255,0.9)',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255,255,255,1)',
      transform: 'scale(1.1)',
    },
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    background: 'rgba(255,255,255,0.95)',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    maxWidth: '250px',
  },
  tooltip: {
    position: 'absolute',
    background: 'rgba(0,0,0,0.9)',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '8px',
    pointerEvents: 'none',
    zIndex: 1000,
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    display: 'none',
  },
  statsOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'rgba(255,255,255,0.95)',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    zIndex: 1000,
  },
}));

interface CidadeFluxo {
  nome: string;
  documentos: number;
  receita: number;
  horaPico: string;
  tendencia: 'up' | 'down' | 'stable';
  latitude?: number;
  longitude?: number;
}

interface MapaD3GeoJSONProps {
  dados: CidadeFluxo[];
}

const MapaD3GeoJSON: React.FC<MapaD3GeoJSONProps> = ({ dados }) => {
  const classes = useStyles();

  return (
    <Card className={classes.mapContainer}>
      <Box p={3} display="flex" alignItems="center" justifyContent="center" height="100%">
        <Typography variant="h6" color="textSecondary">
          <MapIcon style={{ verticalAlign: 'middle', marginRight: 8 }} />
          Mapa D3 + GeoJSON - Funcionalidade desabilitada
        </Typography>
      </Box>
    </Card>
  );
};

export default MapaD3GeoJSON;