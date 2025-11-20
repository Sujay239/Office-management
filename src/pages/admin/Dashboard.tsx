import {
  Paper,
  Group,
  Text,
  Title,
  SimpleGrid,
  Stack,
  Box,
  ThemeIcon,
  Button,
  Table,
  Badge,
  Grid,
  Avatar
} from '@mantine/core';
import {
  IconUsers,
  IconUserPlus,
  IconUserCheck,
  IconUserOff,
  IconSettings,
  IconBell,
  IconDatabase,
} from '@tabler/icons-react';


import { getTokenCookie } from '../../lib/auth';
import { useEffect, useState } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string | null;
  banned?: boolean;
};


export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
  // setLoading(true); (removed)
      try {
        const token = getTokenCookie();
        const [usersRes, attendesRes] = await Promise.all([
          fetch('/api/users', {
            credentials: 'include',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          }),
          fetch('/api/attendes', {
            credentials: 'include',
            headers: { 'Authorization': token ? `Bearer ${token}` : '' },
          })
        ]);
        const usersData = usersRes.ok ? await usersRes.json() : [];
        const attendesData = attendesRes.ok ? await attendesRes.json() : [];
        setUsers(usersData.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.banned ? 'Banned' : (u.active ? 'Active' : 'Pending'),
          avatar: u.avatar || null,
          banned: !!u.banned,
        })));
  // setAttendances(attendesData); (removed)
        // Example: notifications from recent attendance changes
        setNotifications(attendesData.slice(-3).map((a: any) => ({
          title: `Attendance ${a.status}`,
          message: `User ID ${a.user_id} marked as ${a.status} on ${a.date}`,
          priority: a.status === 'Absent' ? 'medium' : 'normal',
        })));
      } catch (err) {
        setUsers([]);
  // setAttendances([]); (removed)
        setNotifications([]);
      } finally {
        // setLoading(false); (removed)
      }
    }
    fetchData();
  }, []);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const bannedUsers = users.filter(u => u.status === 'Banned').length;
  const pendingInvites = users.filter(u => u.status === 'Pending').length;
  // DB size and system health are placeholders
  const dbSize = 'N/A';
  const systemHealth = 'Good';

  const adminStats = [
    { title: 'Total Users', value: totalUsers, icon: IconUsers, color: 'blue' },
    { title: 'Active Users', value: activeUsers, icon: IconUserCheck, color: 'teal' },
    { title: 'Pending Invites', value: pendingInvites, icon: IconUserPlus, color: 'orange' },
    { title: 'Banned Users', value: bannedUsers, icon: IconUserOff, color: 'red' },
    { title: 'DB Size', value: dbSize, icon: IconDatabase, color: 'grape' },
    { title: 'System Health', value: systemHealth, icon: IconSettings, color: 'green' },
  ];

  const recentUsers = users.slice(-3).reverse();


  return (
    <Box py="xl" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Title order={2} mb="lg">Admin Dashboard</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing="lg" mb="xl">
        {adminStats.map((stat) => (
          <Paper key={stat.title} p="md" radius="md" shadow="sm" style={{ background: 'white' }}>
            <Group>
              <ThemeIcon size={40} radius="md" color={stat.color} variant="light">
                <stat.icon size={20} />
              </ThemeIcon>
              <div>
                <Text size="sm" c="dimmed">{stat.title}</Text>
                <Text size="xl" fw={700} c={stat.color}>{stat.value}</Text>
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper p="md" radius="md" shadow="sm" mb="lg">
            <Group align="center" mb="md">
              <ThemeIcon size={32} radius="md" color="blue" variant="light">
                <IconUsers size={20} />
              </ThemeIcon>
              <Title order={4}>Recent Users</Title>
              <Button leftSection={<IconUserPlus size={16} />} variant="light" color="blue" radius="xl" size="xs">Invite User</Button>
            </Group>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentUsers.map((user) => (
                  <Table.Tr key={user.email}>
                    <Table.Td>
                      <Group>
                        <Avatar src={user.avatar} color="blue" radius="xl" size={32}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Text>{user.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Badge color={user.status === 'Active' ? 'green' : user.status === 'Pending' ? 'orange' : 'red'}>{user.status}</Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper p="md" radius="md" shadow="sm">
            <Group align="center" mb="md">
              <ThemeIcon size={32} radius="md" color="blue" variant="light">
                <IconBell size={20} />
              </ThemeIcon>
              <Title order={4}>Notifications</Title>
            </Group>
            <Stack>
              {notifications.map((notification, idx) => (
                <Paper key={idx} p="sm" radius="sm" style={{ borderLeft: `4px solid ${notification.priority === 'medium' ? '#ffd700' : '#4dabf7'}`, background: '#f8f9fa' }}>
                  <Text fw={600} mb={4}>{notification.title}</Text>
                  <Text size="sm" c="dimmed">{notification.message}</Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
