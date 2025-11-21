
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Container,
  Text,
  Title,
  Stack,
  Group,
} from "@mantine/core";
import { IconHome,  IconRotateClockwise } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect } from "react";

// Futuristic 404 component
// Usage: <Futuristic404 onNavigateHome={() => router.push('/')} />
// No external assets required.





export default function NotFoundPage() {
    useEffect(() => {
      document.title = "404 - Not Found";
    });
    const navigate = useNavigate();

    function onNavigateHome() {
      navigate("/");
    }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 600px at 10% 10%, rgba(36, 198, 255, 0.08), transparent 6%), radial-gradient(900px 400px at 90% 90%, rgba(168, 85, 247, 0.06), transparent 6%), linear-gradient(180deg, #020617 0%, #081029 100%)",
        color: "#e6f0ff",
        paddingTop: 48,
        paddingBottom: 48,
      }}
    >
      {/* subtle grid / scanlines */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px)",
          backgroundSize: "100% 24px",
          pointerEvents: "none",
          mixBlendMode: "overlay",
        }}
      />

      <Container size="lg" style={{ position: "relative", zIndex: 2 }}>
        <Center>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "100%" }}
          >
            <Stack gap="xl" align="center">
              <div style={{ textAlign: "center" }}>
                <Title
                  order={1}
                  style={{
                    fontSize: "clamp(36px, 6vw, 64px)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    color: "white",
                    textShadow: "0 6px 30px rgba(2,8,23,0.6)",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      transform: "translateZ(0)",
                    }}
                  >
                    <motion.span
                      initial={{ x: -6 }}
                      animate={{ x: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 90,
                        damping: 12,
                      }}
                      style={{ color: "#9ad5e3" }}
                    >
                      404
                    </motion.span>
                    <span style={{ marginLeft: 12, color: "#c7dbff" }}>
                      — Page not found
                    </span>
                  </span>
                </Title>

                <Text
                  size="lg"
                  color="dimmed"
                  mt="xs"
                  style={{ maxWidth: 760, margin: "12px auto" }}
                >
                  The page you are looking for doesn't exist or has been moved.
                  Try searching or go back home — our nav drones will guide you.
                </Text>
              </div>

              {/* futuristic data panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                style={{ width: "100%" }}
              >
                <Container size="md" style={{ padding: 18 }}>
                  <div
                    style={{
                      borderRadius: 14,
                      padding: 18,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
                      border: "1px solid rgba(255,255,255,0.04)",
                      boxShadow: "0 10px 40px rgba(3,7,18,0.6)",
                      backdropFilter: "blur(8px) saturate(120%)",
                    }}
                  >
                    <Group justify="space-between" align="center" style={{ gap: 12 }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            padding: 10,
                            borderRadius: 10,
                            background:
                              "linear-gradient(135deg, rgba(154,213,227,0.12), rgba(167,139,250,0.06))",
                            border: "1px solid rgba(154,213,227,0.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 68,
                            minHeight: 68,
                          }}
                        >
                          <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 3v4"
                              stroke="#9ad5e3"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 17v4"
                              stroke="#c7dbff"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M4.9 7.5l2.8 1.6"
                              stroke="#a78bfa"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M19.1 15.5l-2.8-1.6"
                              stroke="#9ad5e3"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <circle cx="12" cy="10" r="1.2" fill="#9ad5e3" />
                          </svg>
                        </div>

                        <div>
                          <Text fw={700} size="sm" style={{ color: "#eaf6ff" }}>
                            Navigation systems
                          </Text>
                          <Text size="xs" color="dimmed">
                            Active — routing fallback online
                          </Text>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <Button
                          leftSection={<IconHome size={16} />}
                          onClick={onNavigateHome}
                          radius="lg"
                          variant="gradient"
                          gradient={{ from: "#67e8f9", to: "#7c3aed" }}
                        >
                          Go Home
                        </Button>

                        <Button
                          leftSection={<IconRotateClockwise size={16} />}
                          variant="outline"
                          radius="lg"
                          onClick={() => window.location.reload()}
                        >
                          Refresh
                        </Button>
                      </div>
                    </Group>

                 

                    
                  </div>
                </Container>
              </motion.div>

              {/* decorative stars + grid */}
              <div style={{ width: "100%", marginTop: 12 }}>
                <svg
                  width="100%"
                  height="80"
                  viewBox="0 0 1200 80"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="g1" x1="0" x2="1">
                      <stop
                        offset="0%"
                        stopColor="#9ad5e3"
                        stopOpacity="0.16"
                      />
                      <stop
                        offset="100%"
                        stopColor="#a78bfa"
                        stopOpacity="0.04"
                      />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 60 C 150 10, 300 110, 450 60 C 600 10, 750 110, 900 60 C 1050 10, 1200 60, 1200 60"
                    fill="none"
                    stroke="url(#g1)"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                </svg>
              </div>

              <Text size="xs" color="dimmed" mt="md">
                If you believe this is an error, contact support or head back to
                safety.
              </Text>
            </Stack>
          </motion.div>
        </Center>
      </Container>

      {/* subtle animated orbs */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        style={{ position: "fixed", right: 40, bottom: 40, zIndex: 1 }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 9999,
            background:
              "radial-gradient(circle at 30% 30%, rgba(154,213,227,0.25), rgba(154,213,227,0.08))",
            filter: "blur(18px)",
          }}
        />
      </motion.div>
    </Box>
  );
}
