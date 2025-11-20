import { notifications } from "@mantine/notifications";
import '@mantine/core/styles.css';

import '@mantine/notifications/styles.css';

// Success Notification
export const notifySuccess = (message: string, title = "Success") => {
  notifications.show({
    title,
    message,
    color: "green",
    autoClose: 4000,
    position: "bottom-center"
  });
};

// Error Notification
export const notifyError = (message: string, title = "Error") => {
  notifications.show({
    title,
    message,
    color: "red",
    autoClose: 5000,
    position: "bottom-center"
  });
};

// Warning Notification
export const notifyWarning = (message: string, title = "Warning") => {
  notifications.show({
    title,
    message,
    color: "yellow",
    autoClose: 4500,
    position: "bottom-center"
  });
};