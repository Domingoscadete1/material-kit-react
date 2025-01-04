'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import dayjs from 'dayjs';
import axios from 'axios';
const statusMap = {
  pending: { label: 'Pending', color: 'warning' },
  delivered: { label: 'Delivered', color: 'success' },
  refunded: { label: 'Refunded', color: 'error' },
} as const;

export interface Order {
  id: string;
  customer: { name: string };
  amount: number;
  status: 'pending' | 'delivered' | 'refunded';
  createdAt: Date;
}

export interface LatestOrdersProps {
  orders?: Order[];
  sx?: SxProps;
}


export function LatestOrders({ orders = [], sx }: LatestOrdersProps): React.JSX.Element {
  const [latestRecords, setLatestRecords] = React.useState<Registro[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [postoId, setPostoId] = React.useState<string | null>(null);
  const statusMap = {
    recebimento: { label: 'Recebimento', color: 'success' },
    entrega: { label: 'Entrega', color: 'warning' },
    negacao: { label: 'Negação', color: 'error' },
    devolucao: { label: 'Devolução', color: 'error' },
  } as const;

  const fetchLatestRecords = async (postoId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/posto/registro/${postoId}/`);
      setLatestRecords(response.data.latest); // Armazena os últimos registros
      console.log(response.data);
    } catch (error) {
      console.error('Erro ao buscar os últimos registros:', error);
      setError('Erro ao carregar os últimos registros, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      const postoId = userData.posto?.id;
      if (postoId) {
        setPostoId(postoId);
        fetchLatestRecords(postoId);
      }
    }
  }, []);
  return (
    <Card sx={sx}>
    <CardHeader title="Últimos Registros" />
    <Divider />
    {loading ? (
      <p>Carregando...</p>
    ) : error ? (
      <p>{error}</p>
    ) : (
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Tipo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {latestRecords.map((registro) => {
              const { label, color } = statusMap[registro.tipo] ?? { label: 'Desconhecido', color: 'default' };

              return (
                <TableRow hover key={registro.id}>
                  <TableCell>{registro.id}</TableCell>
                  <TableCell>{registro.responsavel?.nome || 'N/A'}</TableCell>
                  <TableCell>{dayjs(registro.data_operacao).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    <Chip color={color} label={label} size="small" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    )}
    <Divider />
    <CardActions sx={{ justifyContent: 'flex-end' }}>
      <Button
        color="inherit"
        endIcon={<ArrowRightIcon fontSize="var(--icon-fontSize-md)" />}
        size="small"
        variant="text"
      >
        Ver Todos
      </Button>
    </CardActions>
  </Card>
  );
}
