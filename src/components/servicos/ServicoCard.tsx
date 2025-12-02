
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
} from '@material-ui/core';
import {
  Assignment,
  Business,
  Security,
  Person,
  DirectionsCar,
  Description,
  Warning,
  Build,
  LocalShipping,
  AccountBox,
  Search,
  TrendingUp,
} from '@material-ui/icons';
import { motion } from 'framer-motion';
import { Servico } from '../../data/servicos';

const useStyles = makeStyles((theme) => ({
  serviceCard: {
    borderRadius: theme.spacing(1.5),
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: '1px solid #e5e7eb',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
      borderColor: '#2563eb',
    },
  },
  serviceIcon: {
    fontSize: 48,
    color: '#2563eb',
    marginBottom: theme.spacing(2),
  },
  serviceName: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#111827',
    marginBottom: theme.spacing(1),
    minHeight: '2.2rem',
    display: 'flex',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 'auto',
  },
  categoryChip: {
    fontSize: '0.75rem',
    height: 24,
    fontWeight: 'bold',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    marginBottom: theme.spacing(1),
  },
}));

const iconMap: { [key: string]: React.ReactNode } = {
  LocalShipping: <LocalShipping />,
  Search: <Search />,
  TrendingUp: <TrendingUp />,
  Person: <Person />,
  Build: <Build />,
  Description: <Description />,
  Assignment: <Assignment />,
  CheckCircle: <AccountBox />,
  Security: <Security />,
  Business: <Business />,
  Warning: <Warning />,
  AccountBox: <AccountBox />,
  Receipt: <Assignment />,
  FindInPage: <Search />,
  CreditCard: <AccountBox />,
  Flight: <Person />,
};

interface ServicoCardProps {
  servico: Servico;
  onClick: (servicoId: number) => void;
  index?: number;
}

const ServicoCard: React.FC<ServicoCardProps> = ({ servico, onClick, index = 0 }) => {
  const classes = useStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
    >
      <Card
        className={classes.serviceCard}
        onClick={() => onClick(servico.id)}
      >
        <CardContent style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box display="flex" justifyContent="center" marginBottom={2}>
            <Box className={classes.serviceIcon}>
              {iconMap[servico.icone] || <Assignment />}
            </Box>
          </Box>

          <Chip
            label={servico.categoria}
            size="small"
            className={classes.categoryChip}
          />

          <Typography className={classes.serviceName}>
            {servico.nome}
          </Typography>

          <Typography
            variant="body2"
            color="textSecondary"
            style={{ 
              marginBottom: 16, 
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {servico.descricao}
          </Typography>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginTop="auto"
          >
            <Typography className={classes.servicePrice}>
              R$ {servico.valor}
            </Typography>
            <Chip
              label={servico.tipo}
              size="small"
              style={{
                backgroundColor: servico.tipo === 'TAXAS' ? '#dcfce7' : '#fef3c7',
                color: servico.tipo === 'TAXAS' ? '#166534' : '#92400e',
                fontSize: '0.7rem',
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServicoCard;
