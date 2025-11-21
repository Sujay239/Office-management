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
} from "@mantine/core";
import { IconSend, IconMessageCircle, IconCheck } from "@tabler/icons-react";

type Message = {
  id: number;
  author: "me" | "system" | string;
  name?: string;
  text: string;
  time: number;
};

type ChatPanelProps = {
  opened?: boolean;
  onClose?: () => void;
  onSend?: (msg: Message) => void;
  initialOpen?: boolean;
};

export default function ChatPanel({
  opened: openedProp,
  onClose,
  onSend,
  initialOpen = false,
}: ChatPanelProps) {
  const [text, setText] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      author: "system",
      name: "AutoBot",
      text: "Welcome! How can we help you today?",
      time: Date.now() - 1000 * 60 * 12,
    },
    {
      id: 2,
      author: "me",
      name: "You",
      text: "Just checking the new attendance dashboard.",
      time: Date.now() - 1000 * 60 * 9,
    },
    {
      id: 3,
      author: "system",
      name: "AutoBot",
      text: "Nice — everything looks good. Would you like a quick summary?",
      time: Date.now() - 1000 * 60 * 8,
    },
  ]);

  // useRef typed to HTMLDivElement | null so TS knows scrollTo & scrollHeight exist
  const scrollRef = useRef<HTMLDivElement | null>(null);



  // scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // ScrollArea renders a div we can scroll; delay slightly for layout
      setTimeout(() => {
        try {
          el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
        } catch {
          // fallback: set scrollTop
          el.scrollTop = el.scrollHeight;
        }
      }, 40);
    }
  }, [messages, typing]);

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

    // Demo auto-reply (replace with real backend logic)
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply: Message = {
        id: Date.now() + 1,
        author: "system",
        name: "AutoBot",
        text: "Thanks — our team will look into that. Meanwhile try the Export button in the dashboard.",
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

  

  return (
    <>
      {/* Inline centered chat panel */}
      <Center style={{ width: "80vw" }}>
        <Box
          style={{
            width: "100%",
            maxWidth: 920,
            borderRadius: 14,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
            border: "1px solid rgba(255,255,255,0.04)",
            boxShadow: "0 10px 40px rgba(2,6,23,0.55)",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            height: "95vh",
          }}
        >
          {/* Header */}
          <Group
            justify="space-between"
            align="center"
            gap="sm"
            style={{
              overflow: "auto",
            }}
          >
            <Group align="center" gap="xs">
              <Avatar color="blue" radius="xl">
                <IconMessageCircle size={18} />
              </Avatar>
              <div>
                <Text fw={700} size="md" style={{ color: "#228be6" }}>
                  Official Chat
                </Text>
                <Text size="xs" color="dimmed">
                  Auto compuation - office official chat
                </Text>
              </div>
            </Group>

            <Group gap="xs" align="center">
              <Badge color="teal" radius="sm">
                Online
              </Badge>
            </Group>
          </Group>

          <Divider />

          {/* Messages */}
          <ScrollArea
            ref={scrollRef as unknown as React.RefObject<HTMLDivElement>}
            style={{ height: "calc(100% - 120px)", borderRadius: 8 }}
            type="auto"
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
          <Box style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <TextInput
              placeholder="Write a message — press Enter to send"
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
      </Center>
    </>
  );
}
