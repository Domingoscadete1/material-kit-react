'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Grid from '@mui/material/Unstable_Grid2';
import Config from '@/components/Config';

const states = [
  { value: 'alabama', label: 'Alabama' },
  { value: 'new-york', label: 'New York' },
  { value: 'san-francisco', label: 'San Francisco' },
  { value: 'los-angeles', label: 'Los Angeles' },
] as const;

export function AccountDetailsForm(): React.JSX.Element {
  const [userData, setUserData] = React.useState<[]>([]);  // Estado para armazenar lances
  const baseUrl = Config.getApiUrl();
  const mediaUrl=Config.getApiUrlMedia();

  React.useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      setUserData(userData);
      
    }
  }, []);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
        <CardHeader subheader="Seus dados..." title="Perfil" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Primeiro Nome</InputLabel>
                <OutlinedInput defaultValue={userData.nome} label="First name" name="firstName" disabled/>
              </FormControl>
            </Grid>
            {/* <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Último Nome</InputLabel>
                <OutlinedInput defaultValue={userData.nome}label="Last name" name="lastName" disabled/>
              </FormControl>
            </Grid> */}
            <Grid md={6} xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Email</InputLabel>
                <OutlinedInput defaultValue={userData.email} label="Email address" name="email" disabled/>
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Número de Telefone</InputLabel>
                <OutlinedInput label="Phone number" defaultValue={userData.numero_telefone}name="phone" type="tel" disabled />
              </FormControl>
            </Grid>
            <Grid md={6} xs={12}>
              <FormControl fullWidth>
                <InputLabel>Endereço</InputLabel>
                <OutlinedInput defaultValue={userData.endereco} label="Email address" name="state" disabled/>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
      </Card>
    </form>
  );
}
