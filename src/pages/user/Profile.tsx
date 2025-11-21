//Optimized for all devices

import {
  Text,
  Group,
  Paper,
  Grid,
  Avatar,
  Box,
  Badge,
  Stack,
  Button,
  TextInput,
  Modal,
  FileInput,
  Select,
  Divider,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { getTokenCookie } from "../../lib/auth";
import {
  IconMail,
  IconPhone,
  IconMapPin,
  IconPencil,
  IconLogin,
  IconLogout,
  IconCalendar,
} from "@tabler/icons-react";

export default function Profile() {
  type User = {
    id: string | number;
    name: string;
    email: string;
    role: string;
    join_date: string;
    check_in_time: string;
    check_out_time: string;
    created_at?: string;
    phone?: string;
    location?: string;
    avatar?: string;
    githubProfile?: string;
  };

  // const randomRgb = () => {
  //   return `rgb(${Math.floor(Math.random() * 255)} , ${Math.floor(
  //     Math.random() * 255
  //   )}, ${Math.floor(Math.random() * 255)})`;
  // };
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "",
    join_date: "",
    check_in_time: "",
    check_out_time: "",
    created_at: "",
    phone: "",
    location: "",
    avatar: null as File | string | null,
    password: "",
  });

  // 🔧 FIXED: format join_date properly before setting
  useEffect(() => {
    document.title = "Auto computatin - user profile"
    async function fetchUser() {
      try {
        const token = getTokenCookie();
        let userId: string | number | null = null;
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId =
            payload.id ??
            payload.user_id ??
            payload.sub ??
            payload.email ??
            null;
        }
        if (!userId) throw new Error("User not authenticated");

        const userRes = await fetch("/api/users", {
          credentials: "include",
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const usersData = userRes.ok ? await userRes.json() : [];
        const currentUser = usersData.find(
          (u: User) => String(u.id) === String(userId)
        );

        if (currentUser) {
          const formattedJoinDate = currentUser.join_date
            ? new Date(currentUser.join_date).toISOString().split("T")[0]
            : "";

          setUserInfo({
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role || "",
            join_date: formattedJoinDate,
            check_in_time: currentUser.check_in_time || "",
            check_out_time: currentUser.check_out_time || "",
            created_at: currentUser.created_at || "",
            phone: currentUser.phone || "",
            location: currentUser.location || "",
            avatar: currentUser.avatar || null,
            password: "",
          });
        }
      } catch {
        setUserInfo({
          name: "",
          email: "",
          role: "",
          join_date: "",
          check_in_time: "",
          check_out_time: "",
          created_at: "",
          phone: "",
          location: "",
          avatar: null,
          password: "",
        });
      }
    }
    fetchUser();
  }, []);

  const handleUpdateProfile = (values: typeof userInfo) => {
    const token = getTokenCookie();
    const jwtPayload = token ? JSON.parse(atob(token.split(".")[1])) : {};
    const userId =
      jwtPayload.id ??
      jwtPayload.user_id ??
      jwtPayload.sub ??
      jwtPayload.email ??
      null;
    if (!userId) return;

    // Build payload for update
    const updatePayload: Record<string, unknown> = {
      name: values.name,
      email: values.email,
      role: values.role,
      joinDate: values.join_date,
      checkInTime: values.check_in_time,
      checkOutTime: values.check_out_time,
    };
    if (values.password && values.password.trim() !== "") {
      updatePayload.password = values.password.trim();
    }
    fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(updatePayload),
    })
      .then((res) => res.json())
      .then(() => {
        setUserInfo({ ...values, password: "" });
        setIsEditing(false);
      });
  };

  return (
    <Box className="lg:w-[80%]">
      {/* Profile Header */}
      <Paper
        shadow="lg"
        radius="xl"
        p={0}
        mb="xl"
        style={{
          overflow: "hidden",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
        }}
      >
        <Box style={{ height: "67px", position: "relative" }} />

        <Box
          px="xl"
          pb="xl"
          style={{
            marginTop: "-70px",
            background: "linear-gradient(to right,#9ad5e3,#EAECC6) ",
          }}
        >
          <Grid align="center">
            <Grid.Col span={{ base: 12, sm: "auto" }}>
              <Avatar
                src={
                  userInfo.avatar
                    ? typeof userInfo.avatar === "string"
                      ? userInfo.avatar
                      : URL.createObjectURL(userInfo.avatar)
                    : null
                }
                size={150}
                radius={150}
                color="blue"
                style={{
                  marginTop: "10px",
                  border: "6px solid white",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                }}
              >
                {userInfo.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: "auto" }} style={{ flex: 1 }}>
              <Stack gap="md" mt="md">
                <Group justify="space-between" align="center">
                  <div>
                    <Text size="xl" fw={800}>
                      {userInfo.name}
                    </Text>
                    <Text size="sm" c="dimmed" fw={500}>
                      {userInfo.role}
                    </Text>
                  </div>
                </Group>

                <Group gap="sm">
                  <Badge color="blue" radius="md" size="lg">
                    {userInfo.role.toUpperCase()}
                  </Badge>
                  <Badge color="green" radius="md" size="lg">
                    Active Employee
                  </Badge>
                </Group>

                <Divider my="xs" color="black" />

                <Group gap="lg">
                  <Group gap={5}>
                    <IconMail size={18} color="#4B5563" />
                    <Text fw={500}>
                      {userInfo.email || "Sujaykumarkotal8520@gmail.com"}
                    </Text>
                  </Group>
                  <Group gap={5}>
                    <IconPhone size={18} color="#4B5563" />
                    <Text fw={500}>{userInfo.phone || "8145228507"}</Text>
                  </Group>
                  <Group
                    gap={5}
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    <IconMapPin size={18} color="#4B5563" />
                    <Text fw={500}>
                      {userInfo.location || "New town, dum dum, kolkata-700052"}
                    </Text>
                  </Group>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </Box>
      </Paper>

      {/* Buttons */}
      <Group justify="flex-end" mb="xl" gap="md">
        <Button
          leftSection={<IconPencil size={16} />}
          variant="gradient"
          gradient={{ from: "blue", to: "indigo" }}
          radius="xl"
          size="md"
          onClick={() => setIsEditing(true)}
          style={{ boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}
        >
          Edit Profile
        </Button>
      </Group>

      {/* Work Information */}
      <Text size="xl" fw={700} mb="lg" c="blue.7">
        Work Information
      </Text>
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            shadow="sm"
            p="xl"
            radius="lg"
            style={{
              backgroundColor: "#b7cff7",
            }}
          >
            <Stack align="flex-start">
              <Box
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 16,
                  backgroundColor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCalendar size={26} color="#3B82F6" />
              </Box>
              <div>
                <Text fw={600}>Join Date</Text>
                <Text size="lg" mt={5}>
                  {new Date(userInfo.join_date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </div>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            shadow="sm"
            p="xl"
            radius="lg"
            style={{ backgroundColor: "#b7f7d9" }}
          >
            <Stack align="flex-start">
              <Box
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 16,
                  backgroundColor: "#DCFCE7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconLogin size={26} color="#16A34A" />
              </Box>
              <div>
                <Text fw={600}>Check-in Time</Text>
                <Text size="lg" mt={5}>
                  {userInfo.check_in_time || 'Invalid Time'}
                </Text>
              </div>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper
            shadow="sm"
            p="xl"
            radius="lg"
            style={{ backgroundColor: "#FFF1F2" }}
          >
            <Stack align="flex-start">
              <Box
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 16,
                  backgroundColor: "#FCE7F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconLogout size={26} color="#DB2777" />
              </Box>
              <div>
                <Text fw={600}>Check-out Time</Text>
                <Text size="lg" mt={5}>
                  {userInfo.check_out_time || 'Invalid Time'}
                </Text>
              </div>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Edit Profile Modal */}
      <Modal
        opened={isEditing}
        onClose={() => setIsEditing(false)}
        title={
          <Text size="xl" fw={700}>
            Edit Profile Information
          </Text>
        }
        size="xl"
        radius="lg"
        padding="xl"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateProfile(userInfo);
          }}
        >
          <Stack gap="lg">
            <Paper p="lg" radius="md" withBorder>
              <Group align="flex-start" gap="xl">
                <Avatar
                  src={
                    userInfo.avatar
                      ? typeof userInfo.avatar === "string"
                        ? userInfo.avatar
                        : URL.createObjectURL(userInfo.avatar)
                      : null
                  }
                  size={100}
                  radius={100}
                >
                  {userInfo.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" fw={600} mb={8}>
                    Profile Picture
                  </Text>
                  <FileInput
                    accept="image/*"
                    value={
                      typeof userInfo.avatar === "string"
                        ? null
                        : userInfo.avatar
                    }
                    onChange={(file) =>
                      setUserInfo({ ...userInfo, avatar: file })
                    }
                    placeholder="Click to upload new picture"
                  />
                </Box>
              </Group>
            </Paper>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Full Name"
                  value={userInfo.name}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, name: e.target.value })
                  }
                  required
                  size="md"
                  placeholder="Enter your full name"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Email"
                  value={userInfo.email}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, email: e.target.value })
                  }
                  required
                  type="email"
                  size="md"
                  placeholder="Enter your email"
                />
              </Grid.Col>
            </Grid>

            <Paper p="lg" radius="md" withBorder>
              <Text fw={700} mb="md">
                Work Information
              </Text>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Select
                    label="Role"
                    value={userInfo.role}
                    onChange={(value) =>
                      setUserInfo({ ...userInfo, role: value || "" })
                    }
                    data={[
                      "admin",
                      "user",
                      "manager",
                      "developer",
                      "team lead",
                    ]}
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Join Date"
                    type="date"
                    value={userInfo.join_date}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, join_date: e.target.value })
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Check-in Time"
                    type="time"
                    value={userInfo.check_in_time}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        check_in_time: e.target.value,
                      })
                    }
                    size="md"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <TextInput
                    label="Check-out Time"
                    type="time"
                    value={userInfo.check_out_time}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        check_out_time: e.target.value,
                      })
                    }
                    size="md"
                  />
                </Grid.Col>
              </Grid>
            </Paper>

            <TextInput
              label="New Password"
              value={userInfo.password}
              onChange={(e) =>
                setUserInfo({ ...userInfo, password: e.target.value })
              }
              type="password"
              size="md"
              placeholder="Enter new password (leave blank to keep current)"
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                onClick={() => setIsEditing(false)}
                radius="md"
              >
                Cancel
              </Button>
              <Button type="submit" color="blue" radius="md">
                Save Changes
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
