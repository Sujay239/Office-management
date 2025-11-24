import {
  Group,
  Text,
  Select,
  Card,
  Button,
  SimpleGrid,
  Paper,
  Box,
  Title,
  Tooltip,
  Drawer,
  Stack,
} from "@mantine/core";
import { useEffect, useState } from "react";
// import { DatePicker } from '@mantine/dates';
import {
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconX,
  IconClock,
} from "@tabler/icons-react";

// Types
interface Employee {
  id: number;
  name: string;
}
interface Attendance {
  id: number;
  user_id: number;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Late";
  check_in_time?: string;
  check_out_time?: string;
}

// Employees will be fetched from API

// Attendance data from API
const statusMap: Record<string, "Present" | "Absent" | "Leave" | "Late"> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  leave: "Leave",
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthAttendance(
  att: Attendance[],
  empId: number,
  year: number,
  month: number
) {
  return att.filter((a) => {
    const d = new Date(a.date);
    return (
      a.user_id === empId &&
      d.getUTCFullYear() === year &&
      d.getUTCMonth() === month
    );
  });
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = [];
  const dayOfWeek = (firstDay.getDay() + 6) % 7; // Monday as first day
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let day = 1; day <= lastDay.getDate(); day++) {
    week.push(day);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length) {
    for (let i = week.length; i < 7; i++) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

export default function Attendes() {
  // Helper to format date for API
  function formatDateForApi(date: Date) {
    // Always use UTC to avoid timezone issues
    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
      .toISOString()
      .slice(0, 10);
  }
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [status, setStatus] = useState<"Absent" | "Present" | "Leave" | null>(
    null
  );
  // Fetch employees from API
  useEffect(() => {
    async function fetchEmployees() {
      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
          return "";
        };
        const token = getCookie("token");
        const res = await fetch("/api/users", {
          credentials: "include",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        // Map API data to Employee type
        const mapped: Employee[] = data.map((u: any) => ({
          id: u.id,
          name: u.name,
        }));
        setEmployees(mapped);
        if (mapped.length > 0) setSelectedEmpId(String(mapped[0].id));
      } catch {
        setEmployees([]);
      }
    }
    fetchEmployees();
  }, []);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const selectedEmp =
    employees.length > 0 && selectedEmpId
      ? employees.find((e) => String(e.id) === selectedEmpId) || null
      : null;
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const matrix = getMonthMatrix(year, month);

  useEffect(() => {
    async function fetchAttendance() {
      // setLoading(true); (removed)
      try {
        // Get JWT token from cookies
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
          return "";
        };
        const token = getCookie("token");
        const res = await fetch("/api/attendes", {
          credentials: "include",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        if (!res.ok) {
          setAttendance([]);
          // setLoading(false); (removed)
          return;
        }
        const data = await res.json();
        // Map API data to Attendance type
        const mapped: Attendance[] = data.map((a: any) => ({
          id: a.id,
          user_id: a.user_id,
          date: a.date,
          status: statusMap[a.status?.toLowerCase()] || "Present",
          check_in_time: a.check_in_time,
          check_out_time: a.check_out_time,
        }));
        setAttendance(mapped);
      } catch {
        setAttendance([]);
      }
      // setLoading(false); (removed)
    }
    fetchAttendance();
  }, []);

  // Attendance stats for selected employee and month
  const empAttendance = selectedEmp
    ? getMonthAttendance(attendance, selectedEmp.id, year, month)
    : [];
  const presentDays = empAttendance.filter(
    (a) => a.status === "Present"
  ).length;
  const absentDays = empAttendance.filter((a) => a.status === "Absent").length;
  const leaveDays = empAttendance.filter((a) => a.status === "Leave").length;

  const handlePrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <>
      <Box>
        <Paper
          shadow="xs"
          p="md"
          withBorder
          style={{ height: "calc(100vh - 40px)" }}
        >
          <Group justify="space-between" mb="lg">
            <Title order={2}>Attendance Tracker</Title>
            <Group>
              <Select
                placeholder="Search employee..."
                searchable
                data={employees.map((e) => ({
                  value: String(e.id),
                  label: e.name,
                }))}
                value={selectedEmpId}
                onChange={setSelectedEmpId}
                style={{ width: 280 }}
                disabled={employees.length === 0}
              />
              <Text fw={700} size="xl" c="blue.7">
                {selectedEmp ? selectedEmp.name : ""}
              </Text>
            </Group>
          </Group>
          <SimpleGrid cols={{ lg: 3, md: 2 }} spacing="lg" mb="xl">
            <Card
              shadow="sm"
              radius="md"
              withBorder
              style={{
                backgroundColor: "#d4ffd4",
              }}
            >
              <div className="p-4">
                <Group>
                  <IconCheck size={24} color="var(--mantine-color-green-6)" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Present Days
                    </Text>
                    <Text fw={700} size="xl" color="green">
                      {presentDays}
                    </Text>
                  </div>
                </Group>
              </div>
            </Card>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "#fce6e7",
              }}
            >
              <div className="p-4">
                <Group>
                  <IconX size={24} color="var(--mantine-color-red-6)" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Absent Days
                    </Text>
                    <Text fw={700} size="xl" color="red">
                      {absentDays}
                    </Text>
                  </div>
                </Group>
              </div>
            </Card>
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "#f7f0d7",
              }}
            >
              <div className="p-4">
                <Group>
                  <IconClock size={24} color="var(--mantine-color-yellow-6)" />
                  <div>
                    <Text size="xs" c="dimmed">
                      Leave Days
                    </Text>
                    <Text fw={700} size="xl" color="orange">
                      {leaveDays}
                    </Text>
                  </div>
                </Group>
              </div>
            </Card>
          </SimpleGrid>
          <Card
            padding="xl"
            radius="md"
            withBorder
            style={{ display: "flex", flexDirection: "column", flex: 1 }}
          >
            <Group justify="space-between" mb="md">
              <Button
                variant="light"
                color="blue"
                onClick={handlePrev}
                leftSection={<IconChevronLeft size={18} />}
                size="sm"
              >
                <span className="lg:block hidden">Previous</span>
              </Button>
              <Text fw={700} size="md">
                {new Date(year, month).toLocaleString("default", {
                  month: "long",
                })}{" "}
                <span className="max-md:text-base">{year}</span>
              </Text>
              <Button
                variant="light"
                color="blue"
                onClick={handleNext}
                rightSection={<IconChevronRight size={18} />}
                size="sm"
              >
                <span className="lg:block hidden">Next</span>
              </Button>
            </Group>
            <SimpleGrid cols={7} spacing={8} mb={12} style={{ flex: 1 }}>
              {weekdays.map((w) => (
                <Text key={w} ta="center" c="dimmed" fw={500} size="md">
                  {w}
                </Text>
              ))}
            </SimpleGrid>
            <SimpleGrid cols={7} spacing={8} style={{ flex: 1 }}>
              {matrix.flat().map((day, idx) => {
                const isToday =
                  day === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear();
                // Always use UTC for calendar cell date
                const dateStr = day
                  ? new Date(Date.UTC(year, month, day))
                      .toISOString()
                      .slice(0, 10)
                  : "";
                const attendanceDay =
                  day && selectedEmp
                    ? attendance.find((a) => {
                        const attDateObj = new Date(a.date);
                        const attDateStr = new Date(
                          Date.UTC(
                            attDateObj.getUTCFullYear(),
                            attDateObj.getUTCMonth(),
                            attDateObj.getUTCDate()
                          )
                        )
                          .toISOString()
                          .slice(0, 10);
                        return (
                          a.user_id === selectedEmp.id && attDateStr === dateStr
                        );
                      })
                    : null;
                let bgColor = "var(--mantine-color-white)";
                let textColor = "inherit";
                let cellContent: React.ReactNode = day || "";
                let tooltipLabel = attendanceDay ? attendanceDay.status : "";
                if (isToday) {
                  bgColor = "var(--mantine-color-blue-6)";
                  textColor = "white";
                } else if (attendanceDay) {
                  switch (attendanceDay.status) {
                    case "Present":
                      bgColor = "var(--mantine-color-green-1)";
                      // Show check-in/check-out time in cell
                      cellContent = (
                        <div style={{ textAlign: "center" }}>
                          <div>{day}</div>
                          <div style={{ fontSize: 12, color: "#228be6" }}>
                            <span>
                              In:{" "}
                              {attendanceDay.check_in_time
                                ? attendanceDay.check_in_time.slice(0, 5)
                                : "-"}
                            </span>
                            <br />
                            <span>
                              Out:{" "}
                              {attendanceDay.check_out_time
                                ? attendanceDay.check_out_time.slice(0, 5)
                                : "-"}
                            </span>
                          </div>
                        </div>
                      );
                      tooltipLabel = `Present\nIn: ${
                        attendanceDay.check_in_time
                          ? attendanceDay.check_in_time.slice(0, 5)
                          : "-"
                      }\nOut: ${
                        attendanceDay.check_out_time
                          ? attendanceDay.check_out_time.slice(0, 5)
                          : "-"
                      }`;
                      break;
                    case "Absent":
                      bgColor = "var(--mantine-color-red-1)";
                      break;
                    case "Leave":
                      bgColor = "var(--mantine-color-yellow-1)";
                      break;
                  }
                }
                return (
                  <Tooltip
                    key={idx}
                    label={tooltipLabel}
                    multiline
                    disabled={!attendanceDay}
                  >
                    <Paper
                      p="sm"
                      style={{
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: bgColor,
                        color: textColor,
                        fontWeight: isToday ? 700 : 400,
                        opacity: day ? 1 : 0.3,
                        cursor: day ? "pointer" : "default",
                        transition: "transform 0.1s ease",
                        ":hover": {
                          transform: day ? "scale(1.05)" : "none",
                        },
                      }}
                    >
                      {cellContent}
                    </Paper>
                  </Tooltip>
                );
              })}
            </SimpleGrid>
            <Button
              variant="outline"
              color="teal"
              size="lg"
              onClick={() => setDrawerOpened(true)}
              style={{
                marginTop : '18px'
              }}
            >
              Update Attendance
            </Button>
            <Drawer
              opened={drawerOpened}
              onClose={() => setDrawerOpened(false)}
              position="right"
              size="md"
              title="Update Attendance"
            >
              <Stack>
                <Group grow>
                  <Select
                    label="Day"
                    placeholder="Day"
                    data={Array.from({ length: 31 }, (_, i) => ({
                      value: String(i + 1),
                      label: String(i + 1),
                    }))}
                    value={selectedDate ? String(selectedDate.getDate()) : null}
                    onChange={(val) => {
                      if (!val) return;
                      const d = Number(val);
                      const m = selectedDate ? selectedDate.getMonth() : month;
                      const y = selectedDate
                        ? selectedDate.getFullYear()
                        : year;
                      setSelectedDate(new Date(Date.UTC(y, m, d)));
                    }}
                    required
                  />
                  <Select
                    label="Month"
                    placeholder="Month"
                    data={Array.from({ length: 12 }, (_, i) => ({
                      value: String(i + 1),
                      label: new Date(0, i).toLocaleString("default", {
                        month: "long",
                      }),
                    }))}
                    value={
                      selectedDate
                        ? String(selectedDate.getMonth() + 1)
                        : String(month + 1)
                    }
                    onChange={(val) => {
                      if (!val) return;
                      const d = selectedDate ? selectedDate.getDate() : 1;
                      const m = Number(val) - 1;
                      const y = selectedDate
                        ? selectedDate.getFullYear()
                        : year;
                      setSelectedDate(new Date(Date.UTC(y, m, d)));
                    }}
                    required
                  />
                  <Select
                    label="Year"
                    placeholder="Year"
                    data={Array.from({ length: 5 }, (_, i) => {
                      const y = year - 2 + i;
                      return { value: String(y), label: String(y) };
                    })}
                    value={
                      selectedDate
                        ? String(selectedDate.getFullYear())
                        : String(year)
                    }
                    onChange={(val) => {
                      if (!val) return;
                      const d = selectedDate ? selectedDate.getDate() : 1;
                      const m = selectedDate ? selectedDate.getMonth() : month;
                      const y = Number(val);
                      setSelectedDate(new Date(Date.UTC(y, m, d)));
                    }}
                    required
                  />
                </Group>
                <Group>
                  <Button
                    color={status === "Present" ? "green" : "gray"}
                    variant={status === "Present" ? "filled" : "outline"}
                    onClick={() => setStatus("Present")}
                  >
                    Present
                  </Button>
                  <Button
                    color={status === "Absent" ? "red" : "gray"}
                    variant={status === "Absent" ? "filled" : "outline"}
                    onClick={() => setStatus("Absent")}
                  >
                    Absent
                  </Button>
                  <Button
                    color={status === "Leave" ? "yellow" : "gray"}
                    variant={status === "Leave" ? "filled" : "outline"}
                    onClick={() => setStatus("Leave")}
                  >
                    Leave
                  </Button>
                </Group>
                <Button
                  color="teal"
                  disabled={!selectedDate || !status || !selectedEmp}
                  onClick={async () => {
                    if (!selectedDate || !status || !selectedEmp) return;
                    const getCookie = (name: string) => {
                      const value = `; ${document.cookie}`;
                      const parts = value.split(`; ${name}=`);
                      if (parts.length === 2)
                        return parts.pop()?.split(";").shift() || "";
                      return "";
                    };
                    const token = getCookie("token");
                    const dateStr = formatDateForApi(selectedDate);
                    console.log("Remove Status Debug:", {
                      selectedEmpId: selectedEmp.id,
                      dateStr,
                      attendance,
                    });
                    const existing = attendance.find(
                      (a) => a.user_id === selectedEmp.id && a.date === dateStr
                    );
                    if (!existing) {
                      console.log(
                        "No matching attendance found for:",
                        selectedEmp.id,
                        dateStr
                      );
                    }
                    const body = {
                      user_id: selectedEmp.id,
                      date: dateStr,
                      status: status.toLowerCase(),
                    };
                    if (existing) {
                      await fetch(`/api/attendes/${existing.id}`, {
                        method: "PUT",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: token ? `Bearer ${token}` : "",
                        },
                        body: JSON.stringify(body),
                      });
                    } else {
                      await fetch("/api/attendes", {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: token ? `Bearer ${token}` : "",
                        },
                        body: JSON.stringify(body),
                      });
                    }
                    // Refresh attendance
                    setDrawerOpened(false);
                    setSelectedDate(null);
                    setStatus(null);
                    // setLoading(true); (removed)
                    try {
                      const res = await fetch("/api/attendes", {
                        credentials: "include",
                        headers: {
                          Authorization: token ? `Bearer ${token}` : "",
                        },
                      });
                      if (res.ok) {
                        const data = await res.json();
                        const mapped: Attendance[] = data.map((a: any) => ({
                          id: a.id,
                          user_id: a.user_id,
                          date: a.date,
                          status:
                            statusMap[a.status?.toLowerCase()] || "Present",
                          check_in_time: a.check_in_time,
                          check_out_time: a.check_out_time,
                        }));
                        setAttendance(mapped);
                      }
                    } finally {
                      // setLoading(false); (removed)
                    }
                  }}
                >
                  Update
                </Button>
                <Button
                  color="red"
                  variant="outline"
                  disabled={!selectedDate || !selectedEmp}
                  onClick={async () => {
                    if (!selectedDate || !selectedEmp) return;
                    const getCookie = (name: string) => {
                      const value = `; ${document.cookie}`;
                      const parts = value.split(`; ${name}=`);
                      if (parts.length === 2)
                        return parts.pop()?.split(";").shift() || "";
                      return "";
                    };
                    const token = getCookie("token");
                    const dateStr = formatDateForApi(selectedDate); // YYYY-MM-DD
                    // Find record with exact date match
                    const existing = attendance.find(
                      (a) =>
                        a.user_id === selectedEmp.id &&
                        a.date.slice(0, 10) === dateStr
                    );
                    if (existing) {
                      console.log("Deleting attendance id:", existing.id);
                      await fetch(`/api/attendes/${existing.id}`, {
                        method: "DELETE",
                        credentials: "include",
                        headers: {
                          Authorization: token ? `Bearer ${token}` : "",
                        },
                      });
                      // Refresh attendance
                      setDrawerOpened(false);
                      setSelectedDate(null);
                      setStatus(null);
                      // setLoading(true); (removed)
                      try {
                        const res = await fetch("/api/attendes", {
                          credentials: "include",
                          headers: {
                            Authorization: token ? `Bearer ${token}` : "",
                          },
                        });
                        if (res.ok) {
                          const data = await res.json();
                          const mapped: Attendance[] = data.map((a: any) => ({
                            id: a.id,
                            user_id: a.user_id,
                            date: a.date,
                            status:
                              statusMap[a.status?.toLowerCase()] || "Present",
                            check_in_time: a.check_in_time,
                            check_out_time: a.check_out_time,
                          }));
                          setAttendance(mapped);
                        }
                      } finally {
                        // setLoading(false); (removed)
                      }
                    } else {
                      alert(
                        "No attendance record found for this date to remove."
                      );
                    }
                  }}
                >
                  Remove Status
                </Button>
              </Stack>
            </Drawer>
          </Card>
        </Paper>
      </Box>
    </>
  );
}
