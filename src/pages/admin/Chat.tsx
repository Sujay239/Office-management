
import { useState } from 'react';
import { Box, Text, Center, Button, Modal, Stack, Group } from '@mantine/core';
import { notifySuccess } from '../../lib/notify';


export default function Chat() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenGoogleChat = () => {
    window.open('https://chat.google.com/', '_blank', 'noopener,noreferrer,width=1000,height=800');
    notifySuccess('Google Chat opened in new tab');
  };

  return (
    <Center style={{ width: '80vw', height: 'calc(80vh - 60px)' }}>
      <Box>
  <Text size="xl" fw={700} ta="center">Coming Soon</Text>
  <Text size="lg" c="dimmed" ta="center" mt="md">We're working on it.</Text>
        <Group justify="center" mt="md">
          <Button onClick={() => setModalOpen(true)} color="blue">Open Chat</Button>
          <Button onClick={handleOpenGoogleChat} color="teal" variant="outline">Open Google Chat</Button>
        </Group>
        <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Temporary Chat" centered>
          <Stack>
            <Text fw={500}>Test Chat Option</Text>
            <Text c="dimmed" size="sm">This is a temporary chat modal for testing UI.</Text>
            <Button onClick={() => notifySuccess('Test chat message sent!')}>Send Test Message</Button>
          </Stack>
        </Modal>
      </Box>
    </Center>
  );
}
