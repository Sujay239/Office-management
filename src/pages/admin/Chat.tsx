// Chat.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Center,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ActionIcon,
  Badge,
  UnstyledButton,
  Modal,
  Button,
  Select,
} from "@mantine/core";
import {
  IconSend,
  IconMessageCircle,
  IconCheck,
  IconArrowLeft,
  IconPlus,
  IconUsers,
  IconHash,
  IconUser,
} from "@tabler/icons-react";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";

// --- Types ---
type Message = {
  id: number;
  author: "me" | "system" | string;
  name?: string;
  text: string;
  time: number;
};

type ChatType = "user" | "group" | "space";

type Conversation = {
  id: string;
  name: string;
  type: ChatType;
  online?: boolean;
  avatarColor?: string;
};

type ChatPanelProps = {
  opened?: boolean;
  onClose?: () => void;
  onSend?: (msg: Message) => void;
  initialOpen?: boolean;
};

// --- Mock Data ---
const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "u1",
    name: "Alice Johnson",
    type: "user",
    online: true,
    avatarColor: "cyan",
  },
  {
    id: "u2",
    name: "Bob Smith",
    type: "user",
    online: false,
    avatarColor: "orange",
  },
  { id: "g1", name: "Dev Team", type: "group", avatarColor: "blue" },
  {
    id: "s1",
    name: "General Announcements",
    type: "space",
    avatarColor: "grape",
  },
];

export default function ChatPanel({
  // opened: openedProp,
  // onClose,/
  onSend,
  // initialOpen = false,
}: ChatPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- State ---
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(
    INITIAL_CONVERSATIONS
  );

  // Chat Logic State
  const [text, setText] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Creation Modal State
  const [openedCreate, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<string | null>("group");

  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Derived Active Chat Object
  const activeChat = conversations.find((c) => c.id === activeChatId);

  // --- Effects ---

  // Auto-scroll when messages change
  useEffect(() => {
    const el = viewportRef.current;
    if (el) {
      setTimeout(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "smooth",
        });
      }, 40);
    }
  }, [messages, typing, activeChatId]);

  // Load fake messages when switching chats
  useEffect(() => {
    if (activeChatId) {
      setMessages([
        {
          id: 1,
          author: "system",
          name: "AutoBot",
          text: `Welcome to the ${activeChat?.name} chat!`,
          time: Date.now() - 1000 * 60 * 60,
        },
      ]);
    }
  }, [activeChatId, activeChat?.name]);

  // --- Handlers ---

  function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function sendMessage(value: string) {
    if (!value || !value.trim()) return;
    const msg: Message = {
      id: Date.now(),
      author: "me",
      name: "You",
      text: value.trim(),
      time: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    setText("");
    onSend?.(msg);

    // Demo auto-reply
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: Date.now() + 1,
        author: "system",
        name: "AutoBot",
        text: "Received. This is a simulated response.",
        time: Date.now(),
      };
      setMessages((m) => [...m, reply]);
    }, 700 + Math.random() * 800);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(text);
    }
  }

  function handleCreate() {
    if (!newName.trim() || !newType) return;
    const newConv: Conversation = {
      id: Date.now().toString(),
      name: newName,
      type: newType as ChatType,
      avatarColor: newType === "group" ? "indigo" : "pink",
    };
    setConversations((prev) => [...prev, newConv]);
    setNewName("");
    closeCreate();
    setActiveChatId(newConv.id);
  }

  // --- Render Helpers ---

  // 1. Conversation List Item
  const renderConversationItem = (c: Conversation) => {
    const active = activeChatId === c.id;
    return (
      <UnstyledButton
        key={c.id}
        onClick={() => setActiveChatId(c.id)}
        style={{
          width: "100%",
          padding: "12px 16px", // Increased padding for better spacing
          borderRadius: 8,
          // If active: Use a distinct blue color. If inactive: Transparent
          backgroundColor: active ? "rgba(34, 139, 230, 0.25)" : "transparent",
          border: active
            ? "1px solid rgba(34, 139, 230, 0.3)"
            : "1px solid transparent",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (!active)
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <Group wrap="nowrap">
          <Avatar color={c.avatarColor} radius="xl" size={38}>
            {c.type === "user" && <IconUser size={20} />}
            {c.type === "group" && <IconUsers size={20} />}
            {c.type === "space" && <IconHash size={20} />}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text
              size="sm"
              fw={active ? 700 : 500}
              // Force white text if active to contrast with the blue background
              style={{ color: 'black' }}
            >
              {c.name}
            </Text>
            <Text
              size="xs"
              truncate
              // Dimmed if inactive, slightly brighter if active
              style={{
                color: active
                  ? "black"
                  : "rgba(255,255,255,0.5)",
              }}
            >
              {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
            </Text>
          </div>
          {c.online && <Badge size="xs" color="teal" variant="dot" />}
        </Group>
      </UnstyledButton>
    );
  };

  // --- Views ---

  // Sidebar View
  const Sidebar = () => (
    <Box
      style={{
        width: isMobile ? "100%" : 320, // Slightly wider for better spacing
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRight: isMobile ? "none" : "2px solid gray",
      }}
    >
      <Box p="md" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Group justify="space-between">
          <Text fw={700} style={{ color: "#228be6" }} size="lg">
            Chats
          </Text>
          <ActionIcon variant="light" color="blue" onClick={openCreate}>
            <IconPlus size={18} />
          </ActionIcon>
        </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }} type="auto">
        {/* Added padding to the Stack container for left/right spacing */}
        <Stack gap={4} p="md">
          {/* Users */}
          <Text
            size="xs"
            fw={700}
            color="dimmed"
            mt="xs"
            mb={4}
            style={{ paddingLeft: 16 }}
          >
            USERS
          </Text>
          {conversations
            .filter((c) => c.type === "user")
            .map(renderConversationItem)}

          {/* Groups */}
          <Text
            size="xs"
            fw={700}
            color="dimmed"
            mt="md"
            mb={4}
            style={{ paddingLeft: 16 }}
          >
            GROUPS
          </Text>
          {conversations
            .filter((c) => c.type === "group")
            .map(renderConversationItem)}

          {/* Spaces */}
          <Text
            size="xs"
            fw={700}
            color="dimmed"
            mt="md"
            mb={4}
            style={{ paddingLeft: 16 }}
          >
            SPACES
          </Text>
          {conversations
            .filter((c) => c.type === "space")
            .map(renderConversationItem)}
        </Stack>
      </ScrollArea>
    </Box>
  );

  // Chat Area View
  const ChatArea = () => (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        width: "100%",
        padding: isMobile ? 8 : 18,
      }}
    >
      {/* Header */}
      <Group
        justify="space-between"
        align="center"
        gap="sm"
        style={{
          overflow: "hidden",
          flex: "0 0 auto",
        }}
      >
        <Group align="center" gap="xs">
          {isMobile && (
            <ActionIcon
              variant="transparent"
              color="gray"
              onClick={() => setActiveChatId(null)}
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
          )}
          <Avatar color={activeChat?.avatarColor || "blue"} radius="xl">
            {activeChat?.type === "user" ? (
              <IconUser size={18} />
            ) : activeChat?.type === "group" ? (
              <IconUsers size={18} />
            ) : (
              <IconHash size={18} />
            )}
          </Avatar>
          <div>
            <Text fw={700} style={{ color: "#228be6" }}>
              <span className="lg:text-[25px] text-[14px]">
                {activeChat?.name}
              </span>
            </Text>

            {activeChat?.type === "user" ? (
              <Text size="xs" color="dimmed">
                <span className="lg:text-[14px] text-[10px]">
                  Private Chat
                </span>
              </Text>
            ) : activeChat?.type === "group" ? (
              <Text size="xs" color="dimmed">
                <span className="lg:text-[14px] text-[10px]">
                   Group Chat
                </span>
              </Text>
            ) : (
              <Text size="xs" color="dimmed">
                <span className="lg:text-[14px] text-[10px]">
                  Official Chat
                </span>
              </Text>
            )}
          </div>
        </Group>

        <Group gap="xs" align="center">
          {activeChat?.type === "user" && (
            <Badge color={activeChat.online ? "teal" : "red"} radius="sm">
              <span className="md:block hidden">
                {activeChat.online ? "Online" : "Offline"}
              </span>
              {/* Optional: Short text for mobile if you want it visible there too */}
              <span className="md:hidden block">
                {activeChat.online ? "ON" : "OFF"}
              </span>
            </Badge>
          )}
        </Group>
      </Group>

      <Divider />

      {/* Messages */}
      <ScrollArea
        viewportRef={viewportRef}
        style={{ flex: 1, minHeight: 0, borderRadius: isMobile ? 0 : 8 }}
        type="auto"
        className="overflow-x-hidden"
      >
        <Stack gap={10} style={{ padding: "8px 6px", minHeight: 160 }}>
          {messages.map((m) => {
            const mine = m.author === "me";
            return (
              <Group
                key={m.id}
                wrap="nowrap"
                style={{
                  justifyContent: mine ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                }}
              >
                {!mine && (
                  <Avatar size={36} radius={36} color="teal">
                    {m.name?.[0] ?? "A"}
                  </Avatar>
                )}

                <Box
                  style={{
                    maxWidth: "78%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: mine ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    p="xs"
                    radius="md"
                    withBorder
                    style={{
                      background: mine
                        ? "linear-gradient(90deg,#9ad5e3,#7cc7ff)"
                        : "#0b1a2b",
                      color: mine ? "#022" : "#e6f0ff",
                      border: mine
                        ? "1px solid rgba(0,0,0,0.06)"
                        : "1px solid rgba(255,255,255,0.04)",
                      boxShadow: mine
                        ? "0 6px 20px rgba(34,139,230,0.08)"
                        : "0 6px 20px rgba(2,6,23,0.32)",
                    }}
                  >
                    <Text
                      size="sm"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {m.text}
                    </Text>
                  </Paper>

                  <Group gap={6} style={{ marginTop: 6, opacity: 0.8 }}>
                    <Text size="xs" color="dimmed">
                      {formatTime(m.time)}
                    </Text>
                    {mine && <IconCheck size={12} />}
                  </Group>
                </Box>

                {mine && (
                  <Avatar size={36} radius={36} color="blue">
                    Y
                  </Avatar>
                )}
              </Group>
            );
          })}

          {typing && (
            <Group style={{ justifyContent: "flex-start" }}>
              <Avatar size={36} radius={36} color="teal">
                A
              </Avatar>
              <Paper
                p="xs"
                radius="md"
                withBorder
                style={{ background: "#0b1a2b", color: "#e6f0ff" }}
              >
                <Text size="sm">AutoBot is typing…</Text>
              </Paper>
            </Group>
          )}
        </Stack>
      </ScrollArea>

      {/* Input */}
      <Box
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flex: "0 0 auto",
        }}
      >
        <TextInput
          placeholder={`Message ${activeChat?.name}...`}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          rightSectionWidth={46}
          className="w-full"
          variant="filled"
          styles={{
            input: {
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
              color: "inherit",
              backgroundColor: "#dce3e0",
            },
          }}
        />
        <ActionIcon
          size={46}
          radius="md"
          color="blue"
          variant="filled"
          onClick={() => sendMessage(text)}
          aria-label="Send"
        >
          <IconSend size={18} />
        </ActionIcon>
      </Box>
    </Box>
  );

  const EmptyState = () => (
    <Center
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <Avatar size={80} radius={80} color="blue" variant="light">
        <IconMessageCircle size={40} />
      </Avatar>
      <Text size="xl" fw={600} color="dimmed" ta="center">
        Auto computation
        <br />
        Welcome back to office
      </Text>
    </Center>
  );

  return (
    <>
      <Modal
        opened={openedCreate}
        onClose={closeCreate}
        title="Create New Chat"
        centered
      >
        <Stack>
          <TextInput
            label="Name"
            placeholder="Group or Space Name"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
          />
          <Select
            label="Type"
            value={newType}
            onChange={setNewType}
            data={[
              { value: "group", label: "Group" },
              { value: "space", label: "Space" },
            ]}
          />
          <Button fullWidth onClick={handleCreate} mt="md">
            Create
          </Button>
        </Stack>
      </Modal>

      {/* Main Container */}
      <div className="flex justify-center items-center">
      <Center
        className={
          isMobile
            ? "w-screen h-screen p-4 overflow-x-hidden"
            : "w-full lg:w-[83vw]"
        }
      >
        <Box
          style={{
            borderRadius: isMobile ? 0 : 14,
            background: isMobile
              ? "transparent"
              : "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            border: isMobile ? "none" : "1px solid rgba(255,255,255,0.04)",
            boxShadow: isMobile ? "none" : "0 10px 40px rgba(2,6,23,0.55)",
            padding: 0,
            display: "flex",
            flexDirection: "row",
            height: isMobile ? "100vh" : "96vh",
            width: isMobile ? "100vw" : "100%",
            overflow: "hidden",
          }}
          className={isMobile ? "overflow-x-hidden" : "lg:w-[96vw]"}
        >
          {/* Logic for switching views */}
          {isMobile ? (
            activeChatId ? (
              <ChatArea />
            ) : (
              <Sidebar />
            )
          ) : (
            <>
              <Sidebar />
              <Box style={{ flex: 1, height: "100%", position: "relative" }}>
                {activeChatId ? <ChatArea /> : <EmptyState />}
              </Box>
            </>
          )}
        </Box>
      </Center>
      </div>
    </>
  );
}
