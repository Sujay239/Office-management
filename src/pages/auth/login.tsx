import { useForm } from "@mantine/form";
import {
  TextInput,
  PasswordInput,
  Title,
  Button,
  Text,
  Box,
  Flex,
  Image,
  Center,
  Stack,
} from "@mantine/core";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { setTokenCookie } from "../../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    document.title = "Auto Computauion - Login";
  }, []);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6
          ? "Password should include at least 6 characters"
          : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification({
          color: "red",
          title: "Login failed",
          message: data.message || "Invalid credentials",
        });
        setLoading(false);
        return;
      }
      // Save JWT token to cookie
      setTokenCookie(data.token);
      // Optionally save user info
      // localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch {
      showNotification({
        color: "red",
        title: "Error",
        message: "Server error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="gray.1" h="100vh">
      <Flex h="100%" style={{ overflow: "hidden" }}>
        {/* Left side - Image (70%) */}
        <Box
          className="xl:block lg:hidden hidden "
          w="70%"
          pos="relative"
          style={{ borderRadius: "0 20px 20px 0", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)",
              zIndex: 1,
            }}
          />
          <Image
            src="/bg.png"
            alt="Login background"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Stack
            pos="absolute"
            bottom={60}
            left={60}
            c="white"
            style={{ zIndex: 2 }}
            gap="xs"
          >
            <Title
              order={1}
              size={42}
              style={{
                textDecoration: "underline",
                background: "linear-gradient(90deg, #fac5c8, #9a91ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome Back!,
            </Title>
            <Text size="lg" maw={450} style={{ lineHeight: 1.6 }}>
              Login to access your workspace and manage your tasks efficiently.
            </Text>
          </Stack>
        </Box>

        {/* Right side - Login Form */}
        <Box className="w-full xl:w-[30%] " bg="white" p={21}>
          <Title
            className="xl:hidden"
            order={1}
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              textAlign: "center",
              paddingTop: "50px",
              fontSize: "40px",
              textDecoration: "underline",
              background: "linear-gradient(90deg, red, blue)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Auto Computation
          </Title>
          <Center h="100%">
            <Stack w="100%" p={40} gap="lg">
              <Stack gap={0} mb={10}>
                <Title order={2} size={28}>
                  Sign In
                </Title>
                <Text c="dimmed" size="sm">
                  Please enter your credentials to continue
                </Text>
              </Stack>

              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label="Email address"
                    placeholder="hello@example.com"
                    size="md"
                    classNames={{
                      input: "sm:h-[50px] sm:text-[16px]",
                    }}
                    styles={{
                      input: {
                        "&:focus": {
                          borderColor: "var(--mantine-color-blue-5)",
                        },
                      },
                    }}
                    {...form.getInputProps("email")}
                  />

                  <PasswordInput
                    label="Password"
                    placeholder="Your password"
                    size="md"
                    classNames={{
                      input: "sm:h-[50px] sm:text-[16px]",
                    }}
                    styles={{
                      input: {
                        "&:focus": {
                          borderColor: "var(--mantine-color-blue-5)",
                        },
                      },
                    }}
                    {...form.getInputProps("password")}
                  />

                  <Button
                    type="submit"
                    size="md"
                    loading={loading}
                    style={{
                      background:
                        "linear-gradient(45deg, #3b82f6 0%, #2563eb 100%)",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Sign in
                  </Button>
                </Stack>
              </form>
            </Stack>
          </Center>
        </Box>
      </Flex>
    </Box>
  );
}
