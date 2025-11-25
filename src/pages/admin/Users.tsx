import { useState, useEffect } from "react";
import {
  Table,
  Paper,
  Group,
  Button,
  ActionIcon,
  Text,
  Modal,
  Stack,
  TextInput,
  Select,
  Menu,
  // em,
} from "@mantine/core";
import { IconEye, IconEdit, IconTrash, IconDots } from "@tabler/icons-react";
import { notifySuccess, notifyError } from "../../lib/notify";
import { getTokenCookie } from "../../lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  checkInTime?: string;
  checkOutTime?: string;
};
type leftUsers = {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  leftDate : string;
};

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "Employee" },
];

export default function Users() {
  // Get current user role from JWT
  function getCurrentUserRole() {
    const token = getTokenCookie();
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.role || "";
    } catch {
      return "";
    }
  }
  const currentUserRole = getCurrentUserRole();
  const [users, setUsers] = useState<User[]>([]);
  const [left, setLeftUsers] = useState<leftUsers[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getTokenCookie();
        const res1 = await fetch("/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res1.ok){
          notifyError("Failed to fetch Active users");
          return;
        }
        const data = await res1.json();
      const activeUsers = data.filter((u : any) => u.role !== "pastemp");
      const pastEmployees = data.filter((u : any) => u.role === "pastemp");
        setUsers(
          activeUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            joinDate: u.join_date || "",
            checkInTime: u.check_in_time || "",
            checkOutTime: u.check_out_time || "",
          }))
        );


        setLeftUsers(
          pastEmployees.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            joinDate: u.join_date || "",
            leftDate : u.left_date || ""
          }))
        );


      } catch (err) {
        console.error(err);
        (err);
        notifyError("Could not load users");
      }
    };
    fetchUsers();
  }, []);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    joinDate: "",
    checkInTime: "",
    checkOutTime: "",
  });
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    joinDate: "",
    checkInTime: "",
    checkOutTime: "",
  });

  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      joinDate: user.joinDate,
      checkInTime: user.checkInTime || "",
      checkOutTime: user.checkOutTime || "",
    });
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    // client-side validation to avoid backend "All fields are required" errors
    if (
      !editForm.name ||
      !editForm.email ||
      !editForm.role ||
      !editForm.joinDate ||
      !editForm.checkInTime ||
      !editForm.checkOutTime
    ) {
      notifyError("Please fill in all required fields");
      return;
    }

    try {
      const token = getTokenCookie();
      // Build payload using snake_case keys the backend exposes, and only include
      // password when the user actually entered a new one (blank means keep).
      // Format join_date as YYYY-MM-DD and times as HH:mm (24-hour)
      function formatDate(dateStr: string) {
        // Accepts MM/DD/YYYY or YYYY-MM-DD and returns YYYY-MM-DD
        if (!dateStr) return "";
        // If already yyyy-MM-dd
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // If MM/DD/YYYY
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          const [mm, dd, yyyy] = parts;
          return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
        }
        // Fallback: try Date
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        // Get yyyy-MM-dd from local date
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
      function formatTime(timeStr: string) {
        // Accepts HH:mm, HH:mm:ss, or 12-hour (e.g., 10:00 AM) and returns HH:mm
        if (!timeStr) return "";
        // If already HH:mm or HH:mm:ss
        if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeStr)) return timeStr.slice(0, 5);
        // If 12-hour format
        const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([APap][Mm])$/);
        if (match) {
          let hour = parseInt(match[1], 10);
          const minute = match[2];
          const ampm = match[3].toUpperCase();
          if (ampm === "PM" && hour < 12) hour += 12;
          if (ampm === "AM" && hour === 12) hour = 0;
          return `${hour.toString().padStart(2, "0")}:${minute}`;
        }
        return timeStr;
      }

      const payload: Record<string, unknown> = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role.trim(),
        joinDate: formatDate(editForm.joinDate.trim()),
        checkInTime: formatTime(editForm.checkInTime.trim()),
        checkOutTime: formatTime(editForm.checkOutTime.trim()),
      };
      // Only admins can change password: include password in main payload if provided
      if (
        currentUserRole === "admin" &&
        editForm.password &&
        editForm.password.trim() !== ""
      ) {
        payload.password = editForm.password.trim();
      }

      const res = await fetch(`/api/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to surface backend message if present
        let msg = "Failed to update user";
        try {
          const err = await res.json();
          if (err && typeof err === "object" && "message" in err) {
            const e = err as { message?: string };
            if (e.message) msg = e.message;
          }
        } catch {
          /* ignore json parse errors */
        }
        throw new Error(msg);
      }

      const updated = await res.json();
      // Update UI state: do not store passwords locally. Map backend snake_case fields.
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editUser.id
            ? {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                joinDate: updated.join_date || "",
                checkInTime: updated.check_in_time || "",
                checkOutTime: updated.check_out_time || "",
              }
            : u
        )
      );
      setEditUser(null);
      notifySuccess("User updated successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update user";
      notifyError(msg);
    }
  };

  const handleDelete = (user: User) => {
    setDeleteUser(user);
  };

 const confirmDelete = async () => {
   if (!deleteUser) return;
   const token = getTokenCookie();
   const email = deleteUser.email;

   try {
     const res = await fetch("/users", {
       // ← use /api/users
       method: "DELETE",
       headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
       },
       body: JSON.stringify({ email }), // ← send an object
     });

     setDeleteUser(null);

     if (!res.ok) {
       const text = await res.text();
       console.error("Delete failed:", res.status, text);
       notifyError("User deletion not completed.");
       return;
     }

     notifySuccess("User deleted successfully");
     // optional: remove from local state so UI updates immediately:
     setUsers((prev) => prev.filter((u) => u.email !== email));
   } catch (err) {
     console.error("Network error deleting user:", err);
     notifyError("Network error. Could not delete user.");
   }
 };



  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(addForm);
    if (
      !addForm.name ||
      !addForm.email ||
      !addForm.password ||
      !addForm.role ||
      !addForm.joinDate ||
      !addForm.checkInTime ||
      !addForm.checkOutTime
    ) {
      notifyError("Please fill in all required fields");
      return;
    }
    try {
      const token = getTokenCookie();
      // send snake_case to match backend expectation
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // name, email, password, role, joinDate, checkInTime, checkOutTime
        body: JSON.stringify({
          name: addForm.name,
          email: addForm.email,
          password: addForm.password,
          role: addForm.role,
          joinDate: addForm.joinDate,
          checkInTime: addForm.checkInTime,
          checkOutTime: addForm.checkOutTime,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to add user");
      }
      const newUser = await res.json();
      setUsers((prev) => [
        ...prev,
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          joinDate: newUser.join_date || "",
          checkInTime: newUser.check_in_time || "",
          checkOutTime: newUser.check_out_time || "",
        },
      ]);
      setAddForm({
        name: "",
        email: "",
        password: "",
        role: "",
        joinDate: "",
        checkInTime: "",
        checkOutTime: "",
      });
      setAddModal(false);
      notifySuccess("User added successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add user";
      notifyError(msg);
    }
  };

  // const sample = [
  //   {
  //     id: 1,
  //     name: "Alice Johnson",
  //     email: "alice.johnson@example.com",
  //     role: "Admin",
  //     joinDate: "2023-02-14",
  //     checkInTime: "08:55",
  //     checkOutTime: "17:12",
  //   },
  //   {
  //     id: 2,
  //     name: "Brian Smith",
  //     email: "brian.smith@example.com",
  //     role: "Employee",
  //     joinDate: "2023-06-01",
  //     checkInTime: "09:10",
  //   },
  //   {
  //     id: 3,
  //     name: "Cynthia Lee",
  //     email: "cynthia.lee@example.com",
  //     role: "Manager",
  //     joinDate: "2022-11-20",
  //     checkOutTime: "16:45",
  //   },
  //   {
  //     id: 4,
  //     name: "David Kim",
  //     email: "david.kim@example.com",
  //     role: "Employee",
  //     joinDate: "2024-01-08",
  //     checkInTime: "09:02",
  //     checkOutTime: "17:00",
  //   },
  //   {
  //     id: 5,
  //     name: "Emma Carter",
  //     email: "emma.carter@example.com",
  //     role: "HR",
  //     joinDate: "2023-09-12",
  //   },
  // ];

  return (
    <Paper p="md" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Text fw={700} size="lg">
          Manage Users
        </Text>
        <Button onClick={() => setAddModal(true)}>Add User</Button>
      </Group>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <span className="max-sm:text-[10px]">Name</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Email</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Role</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Join Date</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Action</span>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                <span className="max-sm:text-[10px] whitespace-nowrap">{user.name}</span>
              </Table.Td>
              <Table.Td>
                <span className="max-sm:text-[10px]">{user.email}</span>
              </Table.Td>
              <Table.Td>
                <span className="max-sm:text-[10px]">{user.role}</span>
              </Table.Td>
              <Table.Td>
                <span className="max-sm:text-[10px] whitespace-nowrap">
                  {user.joinDate}
                </span>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <div className="lg:block hidden">
                    <ActionIcon
                      color="blue"
                      variant="light"
                      onClick={() => setViewUser(user)}
                    >
                      <IconEye size={18} />
                    </ActionIcon>
                    <ActionIcon
                      color="orange"
                      variant="light"
                      onClick={() => handleEdit(user)}
                    >
                      <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="light"
                      onClick={() => handleDelete(user)}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </div>
                  <div className="lg:hidden">
                    <Menu withinPortal position="bottom-end" shadow="md">
                      <Menu.Target>
                        <ActionIcon color="blue" variant="light">
                          <IconDots size={18} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={16} />}
                          onClick={() => setViewUser(user)}
                        >
                          View
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconEdit size={16} />}
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={<IconTrash size={16} />}
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>



      <div className="mt-20"></div>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <span className="max-sm:text-[10px]">Name</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Email</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Role</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Join Date</span>
            </Table.Th>
            <Table.Th>
              <span className="max-sm:text-[10px]">Leave Date</span>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {left.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                <span className="max-sm:text-[10px] whitespace-nowrap">{user.name}</span>
              </Table.Td>
              <Table.Td>
                <span className="max-sm:text-[10px]">{user.email}</span>
              </Table.Td>
              <Table.Td>
                <span className="max-sm:text-[10px]">{user.role}</span>
              </Table.Td>
              <Table.Td>
                <span className="max-sm:text-[10px] whitespace-nowrap">
                  {user.joinDate}
                </span>
              </Table.Td>
              <Table.Td>
                <span className="max-sm:text-[10px] whitespace-nowrap">
                  {user.leftDate}
                </span>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>



      {/* Add User Modal */}
      <Modal
        opened={addModal}
        onClose={() => setAddModal(false)}
        title="Add New User"
        centered
      >
        <form onSubmit={handleAddUser}>
          <Stack>
            <TextInput
              label="Name"
              value={addForm.name}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
            <TextInput
              label="Email"
              value={addForm.email}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
            <TextInput
              label="Password"
              value={addForm.password}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, password: e.target.value }))
              }
              required
              type="password"
            />
            <Select
              label="Role"
              data={roleOptions}
              value={addForm.role}
              onChange={(v) => setAddForm((f) => ({ ...f, role: v || "" }))}
              required
              placeholder="Select role"
            />
            <TextInput
              label="Join Date"
              value={addForm.joinDate}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, joinDate: e.target.value }))
              }
              required
              type="date"
            />
            <Group grow>
              <TextInput
                label="Check In Time"
                value={addForm.checkInTime}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, checkInTime: e.target.value }))
                }
                required
                type="time"
              />
              <TextInput
                label="Check Out Time"
                value={addForm.checkOutTime}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, checkOutTime: e.target.value }))
                }
                required
                type="time"
              />
            </Group>
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => setAddModal(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">Add</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
      {/* View User Modal */}
      <Modal
        opened={!!viewUser}
        onClose={() => setViewUser(null)}
        title="User Details"
        centered
      >
        {viewUser && (
          <Stack>
            <Text>
              <b>Name:</b> {viewUser.name}
            </Text>
            <Text>
              <b>Email:</b> {viewUser.email}
            </Text>
            <Text>
              <b>Role:</b> {viewUser.role}
            </Text>
            <Text>
              <b>Join Date:</b> {viewUser.joinDate}
            </Text>
            <Text>
              <b>Check In Time:</b> {viewUser.checkInTime || "-"}
            </Text>
            <Text>
              <b>Check Out Time:</b> {viewUser.checkOutTime || "-"}
            </Text>
          </Stack>
        )}
      </Modal>
      {/* Edit User Modal */}
      <Modal
        opened={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User"
        centered
      >
        {editUser && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSave();
            }}
          >
            <Stack>
              <TextInput
                label="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
              <TextInput
                label="Email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
              {currentUserRole === "admin" && (
                <TextInput
                  label="Password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, password: e.target.value }))
                  }
                  type="password"
                  placeholder="Leave blank to keep current password"
                />
              )}
              <Select
                label="Role"
                data={roleOptions}
                value={editForm.role}
                onChange={(v) => setEditForm((f) => ({ ...f, role: v || "" }))}
                required
                placeholder="Select role"
              />
              <TextInput
                label="Join Date"
                value={editForm.joinDate}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, joinDate: e.target.value }))
                }
                required
                type="date"
              />
              <Group grow>
                <TextInput
                  label="Check In Time"
                  value={editForm.checkInTime}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, checkInTime: e.target.value }))
                  }
                  required
                  type="time"
                />
                <TextInput
                  label="Check Out Time"
                  value={editForm.checkOutTime}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, checkOutTime: e.target.value }))
                  }
                  required
                  type="time"
                />
              </Group>
              <Group justify="flex-end">
                <Button
                  variant="light"
                  onClick={() => setEditUser(null)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </Group>
            </Stack>
          </form>
        )}
      </Modal>
      {/* Delete User Modal */}
      <Modal
        opened={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Delete User"
        centered
      >
        {deleteUser && (
          <Stack>
            <Text>
              Are you sure you want to delete <b>{deleteUser.name}</b>?
            </Text>
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => setDeleteUser(null)}
                type="button"
              >
                Cancel
              </Button>
              <Button color="red" onClick={confirmDelete}>
                Delete
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Paper>
  );
}
