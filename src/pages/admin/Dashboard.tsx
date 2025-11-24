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
  // Avatar
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
    {
      title: "Total Users",
      value: totalUsers,
      icon: IconUsers,
      color: "blue",
      bg: "#c3e3f7",
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: IconUserCheck,
      color: "teal",
      bg: "#c3f7c5",
    },
    {
      title: "Pending Invites",
      value: pendingInvites,
      icon: IconUserPlus,
      color: "orange",
      bg: "#f7eadc",
    },
    {
      title: "Banned Users",
      value: bannedUsers,
      icon: IconUserOff,
      color: "red",
      bg: "#f7dcdc",
    },
    {
      title: "DB Size",
      value: dbSize,
      icon: IconDatabase,
      color: "grape",
      bg: "#f4e8fc",
    },
    {
      title: "System Health",
      value: systemHealth,
      icon: IconSettings,
      color: "green",
      bg: "#cffcfb",
    },
  ];

  const recentUsers = users.slice(-3).reverse();

  //Demo Users Data for development purpose change after development
  // const Allusers = [
  //   {
  //     name: "Sujay Patil",
  //     email: "sujay.patil@example.com",
  //     status: "active",
  //   },
  //   {
  //     name: "Ritika Sharma",
  //     email: "ritika.sharma@example.com",
  //     status: "pending",
  //   },
  //   {
  //     name: "Arjun Verma",
  //     email: "arjun.verma@example.com",
  //     status: "nothing",
  //   },
  //   {
  //     name: "Neha Kulkarni",
  //     email: "neha.kulkarni@example.com",
  //     status: "active",
  //   },
  //   {
  //     name: "Rohan Singh",
  //     email: "rohan.singh@example.com",
  //     status: "pending",
  //   },
  //   {
  //     name: "Anita Desai",
  //     email: "anita.desai@example.com",
  //     status: "nothing",
  //   },
  // ];



  return (
    <Box py="xl" style={{ maxWidth: "1400px" }} className="mx-4 lg:m-auto">
      <Title order={2} mb="lg">
        Admin Dashboard
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 6 }} spacing="lg" mb="xl">
        {adminStats.map((stat) => (
          <Paper
            key={stat.title}
            p="xl"
            radius="md"
            shadow="sm"
            style={{ background: `${stat.bg}`, minHeight: 150 }}
          >
            <Group className="mt-4">
              <div className="flex justify-center items-start flex-col gap-2">
                <ThemeIcon
                  size={52}
                  radius="md"
                  color={stat.color}
                  variant="light"
                >
                  <stat.icon size={26} />
                </ThemeIcon>
                <div>
                  <Text size="md" c="dimmed">
                    {stat.title}
                  </Text>
                  <Text size="2xl" fw={700} c={stat.color}>
                    {stat.value}
                  </Text>
                </div>
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
              <Button
                leftSection={<IconUserPlus size={16} />}
                variant="light"
                color="blue"
                radius="xl"
                size="xs"
              >
                Invite User
              </Button>
            </Group>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <span className="lg:text-base text-[11px]">User</span>
                  </Table.Th>
                  <Table.Th>
                    <span className="lg:text-base text-[11px]">Email</span>
                  </Table.Th>
                  <Table.Th>
                    <span className="lg:text-base text-[11px]">Status</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {recentUsers.map((user) => (
                  <Table.Tr key={user.email}>
                    <Table.Td>
                      <Group>
                        <Text>
                          <span className="lg:text-base text-[10px]">
                            {user.name}
                          </span>
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <span className="lg:text-base text-[10px]">
                        {user.email}
                      </span>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={
                          user.status === "active"
                            ? "green"
                            : user.status === "pending"
                            ? "orange"
                            : "red"
                        }
                      >
                        <span className="lg:text-[9px] text-[5px]">
                          {user.status}
                        </span>
                      </Badge>
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
                <Paper
                  key={idx}
                  p="sm"
                  radius="sm"
                  style={{
                    borderLeft: `4px solid ${
                      notification.priority === "medium" ? "#ffd700" : "#4dabf7"
                    }`,
                    background: "#f8f9fa",
                  }}
                >
                  <Text fw={600} mb={4}>
                    {notification.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {notification.message}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
