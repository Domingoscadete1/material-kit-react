
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
import Config from '@/components/Config';

const user = {
  name: 'Sofia Rivers',
  avatar: '/assets/avatar.png',
  jobTitle: 'Senior Developer',
  country: 'USA',
  city: 'Los Angeles',
  timezone: 'GTM-7',
} as const;

export function AccountInfo(): React.JSX.Element {
  const baseUrl = Config.getApiUrl();
  const mediaUrl=Config.getApiUrlMedia();
  const [userData, setUserData] = React.useState<[]>([]);  // Estado para armazenar lances


  React.useEffect(() => {
    const token = localStorage.getItem('userData');
    if (token) {
      const userData = JSON.parse(token);
      setUserData(userData);
      
    }
  }, []);
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={`${mediaUrl}${userData.foto}`} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{userData.nome}</Typography>
            <Typography color="text.secondary" variant="body2">
              {userData.endereco} 
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user.timezone}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        
      </CardActions>
    </Card>
  );
}
