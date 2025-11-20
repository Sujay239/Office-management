import { Card, Group, Text, SimpleGrid, Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useState } from 'react';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix: (number | null)[][] = [];
  let week: (number | null)[] = [];

  // Start with Monday
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
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }

  return matrix;
}
type Attendance = {
  id: number;
  user_id: number;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  check_in_time?: string;
  check_out_time?: string;
};

interface CustomCalendarProps {
  attendance?: Attendance[];
  bigStyle?: boolean;
  showTimes?: boolean;
}

export default function CustomCalendar({ attendance = [], bigStyle = false, showTimes = false }: CustomCalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const matrix = getMonthMatrix(year, month);

  // Map attendance by date for current month
  const dayAttendance: Record<string, Attendance> = {};
  attendance.forEach((a) => {
    const d = new Date(a.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dateStr = d.toISOString().slice(0, 10);
      dayAttendance[dateStr] = a;
    }
  });

  // Month navigation
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

  const currentMonthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <Card padding={bigStyle ? "xl" : "lg"} radius={bigStyle ? "xl" : "md"} withBorder style={bigStyle ? { width: "100%", minHeight: 600, maxWidth: 1100, margin: "0 auto", boxShadow: "0 8px 32px rgba(34,139,230,0.08)" } : {}}>
      <Group justify="space-between" mb={bigStyle ? "xl" : "sm"}>
        <Button variant="subtle" size={bigStyle ? "md" : "sm"} onClick={handlePrev}>
          <IconChevronLeft size={bigStyle ? 28 : 18} />
        </Button>
        <Text fw={900} size={bigStyle ? "2rem" : "lg"} style={bigStyle ? { letterSpacing: 1, color: "#228be6" } : {}}>
          {currentMonthName} {year}
        </Text>
        <Button variant="subtle" size={bigStyle ? "md" : "sm"} onClick={handleNext}>
          <IconChevronRight size={bigStyle ? 28 : 18} />
        </Button>
      </Group>

      <SimpleGrid cols={7} spacing={bigStyle ? 8 : 4} mb={bigStyle ? 12 : 4}>
        {weekdays.map((w) => (
          <Text key={w} ta="center" c="gray.6" fw={700} size={bigStyle ? "lg" : "sm"} style={bigStyle ? { fontSize: "1.2rem" } : {}}>
            {w}
          </Text>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={7} spacing={bigStyle ? 8 : 4}>
        {matrix.flat().map((day, idx) => {
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          let bg = '#fff';
          let textColor = isToday ? '#fff' : '#222';
          let tooltipLabel = '';
          let dot = null;
          let inOut = null;

          if (day) {
            const dateObj = new Date(year, month, day);
            const dateStr = dateObj.toISOString().slice(0, 10);
            const att = dayAttendance[dateStr];

            if (att) {
              switch (att.status) {
                case 'Present':
                  bg = '#e6fbe6';
                  dot = <span style={{ fontSize: bigStyle ? 16 : 10, color: '#2ecc40' }}>●</span>;
                  tooltipLabel = 'Present';
                  break;
                case 'Absent':
                  bg = '#ffeaea';
                  dot = <span style={{ fontSize: bigStyle ? 16 : 10, color: '#e74c3c' }}>●</span>;
                  tooltipLabel = 'Absent';
                  break;
                case 'Leave':
                  bg = '#fffbe6';
                  dot = <span style={{ fontSize: bigStyle ? 16 : 10, color: '#f1c40f' }}>●</span>;
                  tooltipLabel = 'Leave';
                  break;
              }
              if (showTimes) {
                inOut = (
                  <div style={{ fontSize: bigStyle ? "1rem" : "0.7rem", color: "#555", marginTop: 2, textAlign: "center", lineHeight: 1.2 }}>
                    {att.check_in_time && <div>In: {att.check_in_time}</div>}
                    {att.check_out_time && <div>Out: {att.check_out_time}</div>}
                  </div>
                );
              }
            }

            if (isToday) {
              bg = '#ff5757';
              textColor = '#fff';
            }
          }

          return (
            <div
              key={idx}
              title={tooltipLabel}
              style={{
                height: bigStyle ? 90 : 44,
                borderRadius: 12,
                background: bg,
                color: textColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: isToday ? 900 : 500,
                border: day ? '1px solid #eee' : 'none',
                opacity: day ? 1 : 0.3,
                cursor: day ? 'pointer' : 'default',
                transition: 'background 0.2s ease',
                boxShadow: isToday ? '0 0 0 2px #228be6' : undefined,
                position: 'relative',
                fontSize: bigStyle ? "1.3rem" : undefined,
                margin: bigStyle ? 2 : 0,
              }}
            >
              <div style={{ fontWeight: 700 }}>{day}</div>
              {dot}
              {inOut}
            </div>
          );
        })}
      </SimpleGrid>
    </Card>
  );
}
