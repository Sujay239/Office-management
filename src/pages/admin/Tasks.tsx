import { useState, useEffect } from 'react';
import { Paper, Title, Button, Select, TextInput, Textarea, Group, Stack, Table, Badge, Modal, ActionIcon, Menu, MultiSelect, Loader } from '@mantine/core';
import { IconTrash, IconEdit, IconDots } from '@tabler/icons-react';

import { notifySuccess, notifyError } from "../../lib/notify";
import { getTokenCookie } from "../../lib/auth";



export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: [] as string[] });
  const [editTask, setEditTask] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);


  // Map userId to userName
  const userIdToName = (id: number | string) => {
    const user = users.find((u) => String(u.id) === String(id));
    return user ? user.name : id;
  };

  // Fetch users and tasks
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getTokenCookie();
        const [usersRes, tasksRes] = await Promise.all([
          fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/tasks", { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!usersRes.ok || !tasksRes.ok) throw new Error("Failed to fetch data");
        const usersData = await usersRes.json();
        const tasksData = await tasksRes.json();
        setUsers(usersData);
        setTasks(tasksData);
      } catch (err) {
        notifyError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (field: string, value: string | string[]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Add Task

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.assignedTo.length === 0) {
      notifyError("Please fill in all required fields");
      return;
    }
    const token = getTokenCookie();
    // For now, only support single assignee (first selected)
    const user_id = form.assignedTo[0];
    try {
  const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id,
          title: form.title,
          description: form.description,
        }),
      });
      if (!res.ok) throw new Error("Failed to add task");
      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setForm({ title: '', description: '', assignedTo: [] });
      setModalOpen(false);
      notifySuccess("Task added successfully");
    } catch {
      notifyError("Failed to add task");
    }
  };

  // Delete Task
  const handleClear = async (id: number) => {
    const token = getTokenCookie();
    try {
  const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setTasks((prev) => prev.filter((task) => task.id !== id));
      notifySuccess("Task deleted successfully");
    } catch {
      notifyError("Failed to delete task");
    }
  };

  // Edit Task (open modal)

  const handleEdit = (task: any) => {
    setEditTask({
      ...task,
      assignedTo: [String(task.user_id)],
    });
    setEditModalOpen(true);
  };

  // Save Edit

  const handleEditSave = async () => {
    if (!editTask) return;
    const token = getTokenCookie();
    const user_id = editTask.assignedTo[0];
    try {
  const res = await fetch(`/api/tasks/${editTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id,
          title: editTask.title,
          description: editTask.description,
          status: editTask.status,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      notifySuccess("Task updated successfully");
      setEditModalOpen(false);
      setEditTask(null);
    } catch {
      notifyError("Failed to update task");
    }
  };

  // Filter tasks by employee name
  const filteredTasks = tasks.filter(task => {
    const assigneeName = userIdToName(task.user_id).toLowerCase();
    return search === '' || assigneeName.includes(search.toLowerCase());
  });

  return (
    <Stack gap="xl">
      <Title order={2} mb="xs">Tasks</Title>
      <Group justify="space-between" align="center">
        <Group>
          <TextInput
            placeholder="Search by employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
        </Group>
        <Button onClick={() => setModalOpen(true)}>Add Task</Button>
      </Group>
      {loading ? (
        <Loader />
      ) : (
        <Paper p="md" radius="md" shadow="sm">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Assigned To</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTasks.map((task) => (
                <Table.Tr key={task.id}>
                  <Table.Td>{task.title}</Table.Td>
                  <Table.Td>{task.description}</Table.Td>
                  <Table.Td>{userIdToName(task.user_id)}</Table.Td>
                  <Table.Td>
                    <Badge color={task.status === 'pending' ? 'orange' : task.status === 'in_progress' ? 'blue' : 'green'}>
                      {task.status?.replace('_', ' ')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Menu shadow="md" width={160} position="bottom-end">
                        <Menu.Target>
                          <ActionIcon variant="light" color="blue">
                            <IconDots size={18} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => handleEdit(task)}>
                            Edit
                          </Menu.Item>
                          {task.status === 'completed' && (
                            <Menu.Item leftSection={<IconTrash size={16} />} color="red" onClick={() => handleClear(task.id)}>
                              Clear
                            </Menu.Item>
                          )}
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Task" centered>
        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Task Title"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              minRows={2}
            />
              <MultiSelect
                label="Assign To"
                data={users.filter(u => u.role === 'user').map(u => ({ value: String(u.id), label: u.name }))}
                value={form.assignedTo}
                onChange={(v) => handleChange('assignedTo', v)}
                placeholder="Select employees"
                clearable
              />
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setModalOpen(false)} type="button">Cancel</Button>
              <Button type="submit">Add Task</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Task" centered>
        {editTask && (
          <form onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
            <Stack>
              <TextInput
                label="Task Title"
                value={editTask.title}
                onChange={e => setEditTask({ ...editTask, title: e.target.value })}
                required
              />
              <Textarea
                label="Description"
                value={editTask.description}
                onChange={e => setEditTask({ ...editTask, description: e.target.value })}
                minRows={2}
              />
              <MultiSelect
                label="Assign To"
                data={users.filter(u => u.role === 'user').map(u => ({ value: String(u.id), label: u.name }))}
                value={editTask.assignedTo}
                onChange={v => setEditTask({ ...editTask, assignedTo: v })}
                placeholder="Select employees"
                clearable
              />
              <Select
                label="Status"
                data={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ]}
                value={editTask.status}
                onChange={v => v && setEditTask({ ...editTask, status: v })}
              />
              <Group justify="flex-end">
                <Button variant="light" onClick={() => setEditModalOpen(false)} type="button">Cancel</Button>
                <Button type="submit">Save</Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
    </Stack>
  );
}
