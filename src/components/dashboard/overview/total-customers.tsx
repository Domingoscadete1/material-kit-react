'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import Config from '@/components/Config';
import axios from 'axios';  // Para consumir a API
export interface TotalCustomersProps {
  diff?: number;
  trend: 'up' | 'down';
  sx?: SxProps;
  value: string;
}

export function TotalCustomers({ diff, trend, sx, value }: TotalCustomersProps): React.JSX.Element {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'up' ? 'var(--mui-palette-success-main)' : 'var(--mui-palette-error-main)';

  const [lances, setLances] = React.useState<Lance[]>([]);  // Estado para armazenar lances
  const [loading, setLoading] = React.useState(false);  // Estado para controlar o carregamento
  const [error, setError] = React.useState<string | null>(null);  // Estado para mensagens de erro
  const [postoId, setPostoId] = React.useState<string | null>(null);



  const baseUrl = Config.getApiUrl();
  const mediaUrl=Config.getApiUrlMedia();
  const fetchLances = async (postoId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/posto/registro/${postoId}/`);  // Fazendo requisição à API
      setLances(response.data);  // Armazena os lances no estado
      console.log(response.data.lances);
    } catch (error) {
      console.error('Erro ao buscar os lances:', error);
      setError('Erro ao carregar os lances, tente novamente mais tarde.'); // Exibe o erro na interface
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
        fetchLances(postoId);
      }
    }
  }, []);


  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color="text.secondary" variant="overline">
                Total Customers
              </Typography>
              <Typography variant="h4">{lances.registros}</Typography>
            </Stack>
            <Avatar sx={{ backgroundColor: 'var(--mui-palette-success-main)', height: '56px', width: '56px' }}>
              <UsersIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar>
          </Stack>
          {diff ? (
            <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
              <Stack sx={{ alignItems: 'center' }} direction="row" spacing={0.5}>
                <TrendIcon color={trendColor} fontSize="var(--icon-fontSize-md)" />
                <Typography color={trendColor} variant="body2">
                  {diff}%
                </Typography>
              </Stack>
              <Typography color="text.secondary" variant="caption">
                Since last month
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
