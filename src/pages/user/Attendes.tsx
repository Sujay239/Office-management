import { useEffect, useState } from "react";

type Attendance = {
  user_id: string | number;
  date: string;
  status: "Present" | "Absent" | "Leave" | string;
  check_in_time?: string;
  check_out_time?: string;
};
import {
  Paper,
  Text,
  Group,
  Button,
  SimpleGrid,
  Tooltip,
  Card,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconUserCheck,
  IconUserOff,
  IconClock,
} from "@tabler/icons-react";
import { notifyError } from "../../lib/notify";

export default function Attendes() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    document.title = "Auto computation - Attendence";
  });

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true); // removed unused loading state
      try {
        const token =
          window.localStorage.getItem("token") ||
          (window.document.cookie.match(/(?:^|; )token=([^;]*)/)?.[1] ?? null);
        if (!token) throw new Error("No token found");
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;
        const res = await fetch(`/api/attendes?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch attendes");
        const allRecords: Attendance[] = await res.json();
        setRecords(
          allRecords
            .filter((r) => String(r.user_id) === String(userId))
            .map((r) => ({
              ...r,
              status:
                r.status.toLowerCase() === "present"
                  ? "Present"
                  : r.status.toLowerCase() === "absent"
                  ? "Absent"
                  : r.status.toLowerCase() === "leave"
                  ? "Leave"
                  : "Present",
            }))
        );
      } catch (err) {
        notifyError(
          "Error: " + (err instanceof Error ? err.message : "Failed to load")
        );
      } finally {
        // setLoading(false); // removed unused loading state
      }
    };
    fetchData();
  }, [month, year]);

  function getMonthMatrix(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const matrix: (number | null)[][] = [];
    let week: (number | null)[] = [];
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
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
  const matrix = getMonthMatrix(year, month);

  // Calculate summary counts
  const presentCount = records.filter((r) => r.status === "Present").length;
  const absentCount = records.filter((r) => r.status === "Absent").length;
  const leaveCount = records.filter((r) => r.status === "Leave").length;

  return (
    <Paper
      className="lg:w-[70%]  h-full xl:w-[80%] w-full"
      shadow="xs"
      p="xl"
      withBorder
      style={{ minHeight: "100vh" }}
    >
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="lg"
        mb="xl"
        className="flex lg:flex-row flex-col"
      >
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: "#b7f7d9",
          }}
        >
          <Group className="lg:p-8 p-4">
            <IconUserCheck color="#38d996" size={28} />
            <div>
              <Text size="md" fw={600} c="dimmed">
                Present Days
              </Text>
              <Text size="xl" fw={700}>
                {presentCount}
              </Text>
            </div>
          </Group>
        </Card>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: "#fff1f2",
          }}
        >
          <Group className="lg:p-8 p-4">
            <IconUserOff color="#fa5252" size={28} />
            <div>
              <Text size="md" fw={600} c="dimmed">
                Absent Days
              </Text>
              <Text size="xl" fw={700}>
                {absentCount}
              </Text>
            </div>
          </Group>
        </Card>
        <Card
          shadow="sm"
          padding="lg"
          radius="md"
          withBorder
          style={{
            backgroundColor: "#faf9ca",
          }}
        >
          <Group className="lg:p-8 p-4">
            <IconClock color="#fab005" size={28} />
            <div>
              <Text size="md" fw={600} c="dimmed">
                Leave Days
              </Text>
              <Text size="xl" fw={700}>
                {leaveCount}
              </Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>
      <Group className="flex items-center justify-center lg:justify-between!"  mb="lg">
        <Text
          fw={900}
          className="attendance-title"
          style={{ color: "#228be6" }}
        >
          Attendance Calendar
        </Text>

        <Group>
          <Button
            size="xs" // Mantine size helps shrink internal padding
            variant="light"
            color="blue"
            onClick={() => {
              if (month === 11) {
                setMonth(0);
                setYear(year + 1);
              } else {
                setMonth(month + 1);
              }
            }}
            leftSection={<IconChevronLeft size={18} />}
          >
            <span className="hidden md:inline font-bold">Previous</span>{" "}
            {/* show text only on md+ */}
          </Button>
          <Text fw={700} size="md">
            <span className="max-sm:text-[13px]">{new Date(year, month).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}</span>

          </Text>
          <Button
            size="xs" // Mantine size helps shrink internal padding
            variant="light"
            color="blue"
            onClick={() => {
              if (month === 11) {
                setMonth(0);
                setYear(year + 1);
              } else {
                setMonth(month + 1);
              }
            }}
            rightSection={<IconChevronRight size={18} />}
            className="h-8 w-12 md:h-auto md:w-auto px-2" // small by default, auto on md+
          >
            <span className="hidden md:inline font-bold">Next</span>{" "}
            {/* show text only on md+ */}
          </Button>
        </Group>
      </Group>
      <SimpleGrid cols={7} spacing={8} mb={12} style={{ flex: 1 }}>
        {weekdays.map((w) => (
          <Text key={w} ta="center" c="dimmed" fw={500} size="md">
            {w}
          </Text>
        ))}
      </SimpleGrid>
      <div className="flex justify-center items-center">
        <SimpleGrid
          cols={7}
          spacing={8}
          style={{ flex: 1 }}
          className="lg:w-[80%]"
        >
          {matrix.flat().map((day, idx) => {
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            // Always use UTC for calendar cell date
            const dateStr = day
              ? new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
              : "";
            const attendanceDay = day
              ? records.find((a) => {
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
                  return attDateStr === dateStr;
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
                  className="lg:h-25"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: bgColor,
                    color: textColor,
                    fontWeight: isToday ? 900 : 500,
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
      </div>
    </Paper>
  );
}
