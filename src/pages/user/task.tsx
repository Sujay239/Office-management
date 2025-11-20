
import { useEffect, useState } from 'react';
import { Paper, Table, Title, Select, Badge, Group, Text, Box, Loader } from '@mantine/core';
import { getTokenCookie } from '../../lib/auth';
import { notifyError, notifySuccess } from '../../lib/notify';

const statusOptions = [
	{ value: 'pending', label: 'Pending' },
	{ value: 'in_progress', label: 'In Progress' },
	{ value: 'completed', label: 'Completed' },
];

// const demoTasks = [
//   {
//     id: 1,
//     title: "Prepare Report",
//     description: "Monthly performance report for operations team",
//     status: "pending",
//   },
//   {
//     id: 2,
//     title: "Client Meeting",
//     description: "Discuss onboarding requirements with new client",
//     status: "in_progress",
//   },
//   {
//     id: 3,
//     title: "Code Review",
//     description: "Review pull requests for frontend refactor",
//     status: "completed",
//   },
// ];


export default function UserTasks() {
	const [tasks, setTasks] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// Fetch tasks assigned to this user
	useEffect(() => {
		const fetchTasks = async () => {
			setLoading(true);
			try {
				const token = getTokenCookie();
				const res = await fetch('/api/tasks', {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error('Failed to fetch tasks');
				const allTasks = await res.json();
				// Decode user id from token
				const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
				const userId = payload?.id;
				// Only show tasks assigned to this user
				setTasks(allTasks.filter((t: any) => String(t.user_id) === String(userId)));
			} catch {
				notifyError('Failed to load tasks');
			} finally {
				setLoading(false);
			}
		};
		fetchTasks();
	}, []);

	const handleStatusChange = async (id: number, status: string) => {
		const token = getTokenCookie();
		const task = tasks.find(t => t.id === id);
		if (!task) return;
		try {
			const res = await fetch(`/api/tasks/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					user_id: task.user_id,
					title: task.title,
					description: task.description,
					status,
				}),
			});
			if (!res.ok) throw new Error();
			setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
			notifySuccess('Task status updated');
		} catch {
			notifyError('Failed to update status');
		}
	};

	
return (
    <Box maw={1600} className="w-full px-2 sm:px-4">
      <Paper p="xl" radius="lg" shadow="md" withBorder>
        <Group justify="space-between" mb="lg">
          <div>
            <Title order={2} mb={4}>
              My Tasks
            </Title>
            <Text c="dimmed" size="sm">
              View and update the status of your assigned tasks.
            </Text>
          </div>
        </Group>

        {loading ? (
          <Loader />
        ) : (
          // 👇 Scroll wrapper for small screens
          <Box className="w-full overflow-x-auto">
            <Table
              striped
              highlightOnHover
              withColumnBorders
              miw={600}                 // Mantine min-width
              className="min-w-[600px]" // Tailwind backup min-width
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Title</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th className="whitespace-nowrap">
                    Update Status
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {tasks.map((task) => (
                  <Table.Tr key={task.id}>
                    <Table.Td>
                      <Text fw={600}>{task.title}</Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" c="dimmed" className="max-w-xs wrap-break-word">
                        {task.description}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Badge
                        color={
                          task.status === "pending"
                            ? "orange"
                            : task.status === "in_progress"
                            ? "blue"
                            : "green"
                        }
                        size="md"
                        radius="sm"
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </Table.Td>

                    <Table.Td>
                      <Select
                        data={statusOptions}
                        value={task.status}
                        onChange={(v) => v && handleStatusChange(task.id, v)}
                        size="sm"
                        radius="md"
                        style={{ minWidth: 120 }}
                      />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
