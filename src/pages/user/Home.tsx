//Fully Optimized page for all devices

import {
  Text,
  Group,
  SimpleGrid,
  Title,
  Stack,
  Avatar,
  Paper,
  Grid,
  Box,
  ThemeIcon,
} from "@mantine/core";
import {
  IconUserCheck,
  IconUserOff,
  IconClock,
  IconBell,
} from "@tabler/icons-react";
// import CustomCalendar from '../../Components/CustomCalendar';
import { useEffect, useState } from "react";
import { getTokenCookie } from "../../lib/auth";
import { jwtDecode } from "jwt-decode";

type Attendance = {
  id: number;
  user_id: number;
  date: string;
  status: "Present" | "Absent" | "Leave" | string;
};
type Task = {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  status: string;
  due_date?: string;
};

export default function Home() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<Employee | null>(null);

  type Employee = {
    id: number;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
    join_date?: string;
  };
  useEffect(() => {
    document.title = "Auto Computation - User Dashboard";
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getTokenCookie();
        let userId: string | number | null = null;
        if (token) {
          try {
            const payload: Record<string, unknown> = jwtDecode(token);
            userId =
              (payload.id as string | number | undefined) ??
              (payload.user_id as string | number | undefined) ??
              (payload.sub as string | number | undefined) ??
              (payload.email as string | number | undefined) ??
              null;
          } catch {
            userId = null;
          }
        }
        if (!userId) throw new Error("User not authenticated");
        // Fetch all users and find the current user
        const userRes = await fetch("/api/users", {
          credentials: "include",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const users: Employee[] = userRes.ok ? await userRes.json() : [];
        // Only match by id, not email, to avoid showing wrong user
        const currentUser = users.find((u) => String(u.id) === String(userId));
        setUser(currentUser || null);
        // Fetch attendance for this user (same as Attendes page)
        let allAttendance: Attendance[] = [];
        if (currentUser) {
          const attRes = await fetch(
            `/api/attendes?user_id=${currentUser.id}`,
            {
              headers: { Authorization: token ? `Bearer ${token}` : "" },
            }
          );
          allAttendance = attRes.ok ? await attRes.json() : [];
        }
        // Normalize status values to match filter logic
        const normalizedAttendance = (currentUser ? allAttendance : []).map(
          (r) => ({
            ...r,
            status:
              r.status.toLowerCase() === "present"
                ? "Present"
                : r.status.toLowerCase() === "absent"
                ? "Absent"
                : r.status.toLowerCase() === "leave"
                ? "Leave"
                : "Present",
          })
        );
        setAttendance(normalizedAttendance);
        // Fetch tasks for this user
        const taskRes = await fetch("/api/tasks", {
          credentials: "include",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const allTasks: Task[] = taskRes.ok ? await taskRes.json() : [];
        setTasks(
          currentUser
            ? allTasks
                .filter((t) => t.user_id === currentUser.id)
                .slice(-3)
                .reverse()
            : []
        );
      } catch {
        setAttendance([]);
        setTasks([]);
        setUser(null);
      }
    }
    fetchData();
  }, []);

  const currentDate = new Date();
  // Monthly stats
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthAttendance = attendance.filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const presentDays =
    monthAttendance.filter((a) => a.status === "Present").length - 1;
  const absentDays =
    monthAttendance.filter((a) => a.status === "Absent").length - 1;
  const leaveDays = monthAttendance.filter((a) => a.status === "Leave").length;

  // Attendance rate calculation
  const totalDays = monthAttendance.length;
  const attendanceRate =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
  // Format join date
  const joinDate = user?.join_date
    ? new Date(user.join_date).toLocaleDateString()
    : "";

  return (
    <Box className="md:w-[80%] h-full">
      {/* Header Section */}
      <Paper
        shadow="xs"
        p="md"
        mb="lg"
        radius="md"
        style={{ background: "linear-gradient(to right, #a1c4fd, #c2e9fb)" }}
      >
        <Grid align="center" className="lg:p-[2.5em]">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group>
              <Avatar
                src={user?.avatar || null}
                color="blue"
                radius="xl"
                size={56}
                style={{
                  border: "3px solid #228be6",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {user
                  ? user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                  : ""}
              </Avatar>
              <div>
                <Text fw={700} size="xl">
                  {user ? user.name : "Employee"}
                </Text>
                <Text size="sm" c="dimmed">
                  {user ? user.email : ""}
                </Text>
              </div>
            </Group>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group justify="flex-end" gap="lg">
              <div>
                <Text size="sm" c="dimmed" mb={3}>
                  Today's Date
                </Text>
                <Text fw={500} size="lg">
                  {currentDate.toLocaleString("default", { month: "long" })}{" "}
                  {currentDate.getDate()}, {currentDate.getFullYear()}
                </Text>
              </div>
            </Group>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Quick Stats Section */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        <Paper
          className="lg:p-[3em] p-[1.5em]"
          radius="md"
          shadow="sm"
          style={{ background: "#d2fce7" }}
        >
          <Group>
            <ThemeIcon
              size={48}
              radius="md"
              color="teal"
              variant="light"
              style={{
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                border: "3px solid #94f7a2",
              }}
            >
              <IconUserCheck size={24} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text size="sm" c="dimmed" mb={4}>
                Present Days
              </Text>
              <Text size="xl" fw={700} c="teal">
                {presentDays}
              </Text>
            </div>
          </Group>
        </Paper>
        <Paper
          className="lg:p-[3em] p-[1.5em]"
          radius="md"
          shadow="sm"
          style={{ background: "#fce1e1" }}
        >
          <Group>
            <ThemeIcon
              size={48}
              radius="md"
              color="red"
              variant="light"
              style={{
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                border: "3px solid #f7a8aa",
              }}
            >
              <IconUserOff size={24} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text size="sm" c="dimmed" mb={4}>
                Absent Days
              </Text>
              <Text size="xl" fw={700} c="red">
                {absentDays}
              </Text>
            </div>
          </Group>
        </Paper>
        <Paper
          className="lg:p-[3em] p-[1.5em]"
          radius="md"
          shadow="sm"
          style={{ background: "#fcece1" }}
        >
          <Group>
            <ThemeIcon
              size={48}
              radius="md"
              color="yellow"
              variant="light"
              style={{
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                border: "3px solid #f7bda8",
              }}
            >
              <IconClock size={24} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text size="sm" c="dimmed" mb={4}>
                Leave Days
              </Text>
              <Text size="xl" fw={700} c="yellow">
                {leaveDays}
              </Text>
            </div>
          </Group>
        </Paper>
        <Paper
          className="lg:p-[3em] p-[1.5em]"
          radius="md"
          shadow="sm"
          style={{ background: "#cad7ed" }}
        >
          <Group>
            <ThemeIcon
              size={48}
              radius="md"
              color="blue"
              variant="light"
              style={{
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                border: "3px solid #9abefc",
              }}
            >
              <IconUserCheck size={24} />
            </ThemeIcon>
            <div style={{ flex: 1 }}>
              <Text size="sm" c="dimmed" mb={4}>
                Attendance Rate
              </Text>
              <Text size="xl" fw={700} c="blue">
                {attendanceRate}%
              </Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Profile & Needs Section */}
      <SimpleGrid cols={{ base: 1 }} spacing="lg" mb="xl">
        <Paper
          // className="lg:w-full"
          className="lg:p-[3em] p-[1.5em] lg:w-full"
          radius="md"
          shadow="sm"
          style={{ background: "#ebeff5" }}
        >
          <Group>
            <Avatar
              src={user?.avatar || null}
              color="blue"
              radius="xl"
              size={48}
            />
            <div className="flex flex-col flex-wrap gap-2">
              <Text fw={700} size="lg">
                {user ? user.name : "Employee"}
              </Text>
              <Text size="sm" c="dimmed">
                {user ? user.email : "Email id : "}
              </Text>
              <Text size="sm" c="dimmed">
                Role: {user?.role || "N/A"}
              </Text>
              <Text size="sm" c="dimmed">
                Join Date: {joinDate}
              </Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Content Section */}
      <Grid gutter="lg">
        <Grid.Col className="lg:w-full">
          <Paper
            p="md"
            radius="md"
            shadow="sm"
            mb="lg"
            style={{ background: "#ebeff5" }}
          >
            <Group
              align="center"
              mb="md"
              className="flex justify-center items-center"
            >
              <ThemeIcon size={44} radius="md" color="blue" variant="light">
                <IconBell size={30} />
              </ThemeIcon>
              <Title order={3}>Recent Tasks</Title>
            </Group>
            <Stack className="ml-[4em] flex gap-2 flex-col">
              {tasks.slice(0, 3).map((task) => (
                <Paper
                  key={task.id}
                  p="sm"
                  radius="sm"
                  style={{
                    borderLeft: `4px solid ${
                      task.status === "pending" ? "#ffd700" : "#4dabf7"
                    }`,
                    background: "#f8f9fa",
                  }}
                >
                  <Text fw={600} mb={4}>
                    {task.title}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {task.description}
                  </Text>
                </Paper>
              ))}
              {tasks.length === 0 && (
                <Text size="sm" c="dimmed">
                  No recent tasks found.
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
        {/* Calendar removed as requested */}
      </Grid>
    </Box>
  );
}
