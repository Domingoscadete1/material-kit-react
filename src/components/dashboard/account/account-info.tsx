
'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Config from '../../../../Config';
import { fetchWithToken } from '../../../../authService';




export function AccountInfo(): React.JSX.Element {
  const baseUrl = Config.getApiUrl();
  const mediaUrl=Config.getApiUrlMedia();
  const [userData, setUserData] = React.useState<any>(null);
  const [funcionario, setFuncionario] = React.useState<[]>([]);  


  React.useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      setUserData(userData);
      
    }
  }, []);
  
  React.useEffect(() => {
    const fetchFuncionario = async () => {
      if (!userData?.id) return; // Evita chamar com id indefinido

    try {
      const response = await fetchWithToken(`api/funcionario/${userData.id}/`, {
        method: 'GET',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });

      const data = await response.json();
      console.log(data);
      setFuncionario(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };
    fetchFuncionario();
  }, [userData]); 

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={funcionario?.foto} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{funcionario?.nome}</Typography>
            <Typography color="text.secondary" variant="body2">
              {funcionario?.endereco} 
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
    </Card>
  );
}
