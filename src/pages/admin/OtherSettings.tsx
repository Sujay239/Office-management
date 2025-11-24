import { useState } from 'react';
import { Paper, Title, Text, TextInput, Button, Group, Stack,  ActionIcon, Badge } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';

export default function OtherSettings() {
  const [ip, setIp] = useState('');
  const [allowedIps, setAllowedIps] = useState<string[]>([]);

  const handleAddIp = () => {
    if (ip && !allowedIps.includes(ip)) {
      setAllowedIps(prev => [...prev, ip]);
      setIp('');
    }
  };

  const handleRemoveIp = (removeIp: string) => {
    setAllowedIps(prev => prev.filter(ip => ip !== removeIp));
  };

  const handleSave = () => {
    // Save logic here (API call or local storage)
  };

  return (
    <div className="flex justify-center items-center min-h-[85vh] max-md:mx-4">
      <Paper
        p="md"
        radius="md"
        shadow="sm"
        maw={500}
        mx="auto"
        style={{
          border: "2px solid green",
          backgroundColor: "#e3fcea",
        }}
      >
        <Title order={3} mb="md">
          Allowed IPs for User Check-In
        </Title>
        <Text c="dimmed" mb="md">
          Only users from these IP addresses can access the check-in button. Add
          multiple IPs as needed.
        </Text>
        <Group mb="md" align="flex-end">
          <TextInput
            label="Add IP Address"
            placeholder="e.g. 192.168.1.100"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleAddIp}
            disabled={!ip || allowedIps.includes(ip)}
          >
            Add
          </Button>
        </Group>
        <Stack mb="md">
          {allowedIps.length === 0 ? (
            <Text c="dimmed">No IPs added yet.</Text>
          ) : (
            <Group gap="xs" wrap="wrap">
              {allowedIps.map((ip) => (
                <Badge
                  key={ip}
                  rightSection={
                    <ActionIcon
                      size="lg"
                      color="red"
                      variant="subtle"
                      onClick={() => handleRemoveIp(ip)}
                    >
                      <IconTrash size={15} />
                    </ActionIcon>
                  }
                  size="18px"
                >
                  {ip}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
        <Button onClick={handleSave} color="blue" fullWidth>
          Save Allowed IPs
        </Button>
      </Paper>
    </div>
  );
}
