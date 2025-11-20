
import { useEffect, useState } from 'react';

// Helper to get cookie value by name
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}
import { Paper, Table, Group, Title, Button } from '@mantine/core';

type AttendesRecord = {
  id: number;
  user_id: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
  name?: string; // will be filled after fetching user name
};

function formatTime12h(timeStr: string | null) {
  if (!timeStr) return '-';
  // Accepts 'HH:mm:ss' or 'HH:mm'
  const [h, m] = timeStr.split(':');
  let hour = Number(h);
  const minute = Number(m);
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${String(minute).padStart(2, '0')} ${ampm}`;
}

export default function Log() {
  const [records, setRecords] = useState<AttendesRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Get attendes records
  const token = getCookie('token');
  console.log('JWT token from cookies:', token);
  const res = await fetch('/api/attendes', {
          credentials: 'include',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        if (!res.ok) {
          console.error('Attendes API error:', res.status, await res.text());
          setRecords([]);
          setLoading(false);
          return;
        }
        const attendes: AttendesRecord[] = await res.json();
        // Get users for name mapping
  const userRes = await fetch('/api/users', {
          credentials: 'include',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        if (!userRes.ok) {
          console.error('Users API error:', userRes.status, await userRes.text());
          setRecords([]);
          setLoading(false);
          return;
        }
        const users: { id: number; name: string }[] = await userRes.json();
        const userMap: Record<number, string> = {};
        users.forEach((u) => {
          userMap[u.id] = u.name;
        });
        // Attach name to each record and filter by today's date
        // Get today's local date string (YYYY-MM-DD)
        const todayLocal = new Date();
        const todayStr = todayLocal.getFullYear() + '-' + String(todayLocal.getMonth() + 1).padStart(2, '0') + '-' + String(todayLocal.getDate()).padStart(2, '0');
        const allRecords = attendes.map((rec) => ({
          ...rec,
          name: userMap[rec.user_id] || 'Unknown',
        }));
        console.log('All fetched records:', allRecords);
        // Convert record date to local date for comparison
        const withNames = allRecords.filter((rec) => {
          const recDate = new Date(rec.date);
          const recLocalStr = recDate.getFullYear() + '-' + String(recDate.getMonth() + 1).padStart(2, '0') + '-' + String(recDate.getDate()).padStart(2, '0');
          return recLocalStr === todayStr;
        });
        setRecords(withNames);
      } catch (err) {
        console.error('Fetch error:', err);
        setRecords([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <Paper p="md" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Title order={3}>Office In/Out Records</Title>
        <Button variant="light" color="blue" disabled>Add Record</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Employee Name</Table.Th>
            <Table.Th>Check-In</Table.Th>
            <Table.Th>Check-Out</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading ? (
            <Table.Tr><Table.Td colSpan={3}>Loading...</Table.Td></Table.Tr>
          ) : records.length === 0 ? (
            <Table.Tr><Table.Td colSpan={3}>No records found</Table.Td></Table.Tr>
          ) : (
            records.map((rec) => (
              <Table.Tr key={rec.id}>
                <Table.Td>{rec.name}</Table.Td>
                <Table.Td>{formatTime12h(rec.check_in_time)}</Table.Td>
                <Table.Td>{formatTime12h(rec.check_out_time)}</Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

// ...existing code...

