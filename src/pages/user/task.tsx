//Optimized for all devices

import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  Title,
  Select,
  Badge,
  Group,
  Text,
  Box,
  Loader,
} from "@mantine/core";
import { getTokenCookie } from "../../lib/auth";
import { notifyError, notifySuccess } from "../../lib/notify";
import React from "react";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];



export default function UserTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

//   const demoTasks = [
//   {
//     id: 1,
//     title: "Prepare Report",
//     description: "Monthly performance report for operations team made a react project for myself as i use in office for tracking emp enggagement",
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


  // Fetch tasks assigned to this user
  useEffect(() => {
    document.title = "Auto Computation - User Tasks";
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const token = getTokenCookie();
        const res = await fetch("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const allTasks = await res.json();
        // Decode user id from token
        const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
        const userId = payload?.id;
        // Only show tasks assigned to this user
        setTasks(
          allTasks.filter((t: any) => String(t.user_id) === String(userId))
        );
      } catch {
        notifyError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    const token = getTokenCookie();
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      notifySuccess("Task status updated");
    } catch {
      notifyError("Failed to update status");
    }
  };


  return (
    <Box maw={1600} className="w-full lg:px-4">
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
          <Box>
            {/* parent container (keeps full width on mobile, centers on desktop) */}
            <div className="w-full flex justify-center">
              {/* inner wrapper constrains the table width and centers it */}
              <div className="w-[97%]">
                {" "}
                {/* adjust max-w-4xl as needed */}
                <Table
                  striped
                  highlightOnHover
                  withColumnBorders
                  miw={600} // Mantine min-width
                  className="hidden md:table " // show only on lg and up
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th className="text-center">Title</Table.Th>
                      <Table.Th className="text-center">Description</Table.Th>
                      <Table.Th className="text-center">Status</Table.Th>
                      <Table.Th className="text-center">Update Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    {tasks.map((task) => (
                      <Table.Tr key={task.id}>
                        <Table.Td>
                          <Text fw={600}>{task.title}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            size="sm"
                            c="dimmed"
                            className="max-w-xs wrap-break-word"
                          >
                            {task.description}
                          </Text>
                        </Table.Td>
                        <Table.Td className="text-center">
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
                        <Table.Td className="text-center">
                          <Select
                            data={statusOptions}
                            value={task.status}
                            onChange={(v) =>
                              v && handleStatusChange(task.id, v)
                            }
                            size="sm"
                            radius="md"
                            style={{ minWidth: 120 }}
                          />
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            </div>

            <Table
              striped
              highlightOnHover
              withColumnBorders
              miw={0}
              className="w-full md:hidden block table-fixed text-[11px] sm:text-[12px]"
              style={{ tableLayout: "fixed" }}
            >
              <Table.Thead>
                <Table.Tr>
                  {/* Title column: larger */}
                  <Table.Th
                    style={{ width: "30%" }}
                    className="p-1 text-center"
                  >
                    Title
                  </Table.Th>

                  {/* Update column: smaller */}
                  <Table.Th
                    style={{ width: "30%" }}
                    className="p-1 text-center"
                  >
                    Update
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <Table.Tr>
                      {/* Title cell: truncates on small screens */}
                      <Table.Td style={{ padding: "6px" }}>
                        <div
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: 11,
                            lineHeight: 1.2,
                          }}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      </Table.Td>

                      {/* Update cell */}
                      <Table.Td

                        style={{ padding: "6px", textAlign: "center" }}
                      >
                        <div className="flex items-center justify-start gap-2">
                          <Select
                            data={statusOptions}
                            value={task.status}
                            onChange={(v) =>
                              v && handleStatusChange(task.id, v)
                            }
                            size="xs"
                            radius="sm"
                            classNames={{
                              input: "text-[10px] py-1 px-2",
                              dropdown: "text-[10px]",
                            }}
                            style={{ width: 90, minWidth: 72, maxWidth: 100 }}
                          />

                          <button
                            className="text-[11px] px-2 py-1 rounded-md border border-gray-200"
                            aria-expanded={openId === task.id}
                            onClick={() =>
                              setOpenId(openId === task.id ? null : task.id)
                            }
                            type="button"
                          >
                            {openId === task.id ? "Hide" : "More"}
                          </button>
                        </div>
                      </Table.Td>
                    </Table.Tr>

                    {/* Collapsible details row (spans both columns) */}
                    <Table.Tr className="w-full">
                      <Table.Td colSpan={2} className="p-0 w-full">
                        <div>
                          <div
                            aria-hidden={openId !== task.id}
                            style={{
                              maxHeight: openId === task.id ? 400 : 0,
                              overflow: "hidden",
                              transition: "max-height 220ms ease",
                            }}
                          >

                              <Group className="flex justify-between items-center flex-col">
                                <div style={{ minWidth: '100%' }}>
                                  <Text size="xs" fw={600}>
                                    Status
                                  </Text>
                                  <Badge
                                    className="mt-1"
                                    size="xs"
                                    radius="sm"
                                    color={
                                      task.status === "pending"
                                        ? "orange"
                                        : task.status === "in_progress"
                                        ? "blue"
                                        : "green"
                                    }
                                  >
                                    {task.status.replace("_", " ")}
                                  </Badge>
                                </div>

                                <div style={{ flex: 1, marginLeft: 8 }}>
                                  <Text size="xs" fw={600}>
                                    Description
                                  </Text>
                                  <Text
                                    size="xs"
                                    c="dimmed"
                                    style={{ marginTop: 6, lineHeight: 1.3 }}
                                  >
                                    {task.description || "No description"}
                                  </Text>
                                </div>
                              </Group>

                          </div>
                        </div>
                      </Table.Td>
                    </Table.Tr>
                  </React.Fragment>
                ))}
              </Table.Tbody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
