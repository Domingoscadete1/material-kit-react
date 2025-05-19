'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';

interface UserData {
  nome?: string;
  email?: string;
  numero_telefone?: string;
  endereco?: string;
}

export function AccountDetailsForm(): React.JSX.Element {
  const [userData, setUserData] = React.useState<UserData>({});

  React.useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      try {
        const parsedData = JSON.parse(token);
        setUserData(parsedData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
        <CardHeader subheader="Meus dados..." title="Perfil" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <OutlinedInput
                  id="nome"
                  defaultValue={userData.nome || ''}
                  name="nome"
                  placeholder="Nome"
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <OutlinedInput
                  id="email"
                  defaultValue={userData.email || ''}
                  name="email"
                  type="email"
                  placeholder="Email"
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <OutlinedInput
                  id="telefone"
                  defaultValue={userData.numero_telefone || ''}
                  name="telefone"
                  type="tel"
                  placeholder="Telefone"
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <OutlinedInput
                  id="endereco"
                  defaultValue={userData.endereco || ''}
                  name="endereco"
                  placeholder="Endereço"
                  disabled
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
      </Card>
    </form>
  );
}
