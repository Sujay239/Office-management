import React, { useState } from "react";
import { notifyError, notifySuccess } from "../lib/notify";
import { Burger, Container, Group, Button, Paper } from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
import { Link, useLocation } from "react-router-dom";
import { IconLogin, IconLogout } from "@tabler/icons-react";

import classes from "./HeaderSimple.module.css";

const links = [
  { link: "/user", label: "Home" },
  { link: "/user/tasks", label: "Tasks" },
  { link: "/user/profile", label: "Profile" },
  { link: "/user/attendes", label: "Attendes" },
  {link : "/user/chat" , label : "Chat"}
];

export function Nav() {
  const [opened , setOpened] = useState(false);
  const location = useLocation();
  const [active, setActive] = useState(location.pathname);

  const items = links.map((link) => (
    <Link
      key={link.label}
      to={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={() => {
        setActive(link.link);
        setOpened(!opened);
      }}
    >
      {link.label}
    </Link>
  ));

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
  };

  return (
    <header
      className={classes.header}
      style={{
        padding: "1px 0",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.95)",
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      <Container
        size="90%"
        className={classes.inner}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 24px",
          height: "64px",
          minHeight: "64px",
          boxSizing: "border-box",
        }}
      >
        <img
          src="/logo.png"
          alt="Logo"
          className="lg:w-[142px] w-[100px]"
          style={{
            height: 38,
            // marginRight: 24,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
        />

        {/* Centered nav menu */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Group
            gap={32}
            visibleFrom="xs"
            style={{
              justifyContent: "center",
            }}
          >
            {items.map((item) => (
              <div
                key={item.key}
                className="transition-all after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-0 after:bg-current after:duration-300 hover:after:w-[90%] hover:scale-105 hover:rounded-xl  hover:text-black"
                style={{
                  position: "relative",
                  padding: "4px 0",
                }}
              >
                {item}
                {active === item.props.to && (
                  <div
                    className="hover:no-underline"
                    style={{
                      position: "absolute",
                      bottom: -2,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "#228be6",
                      borderRadius: "2px",
                    }}
                  />
                )}
              </div>
            ))}
          </Group>
        </nav>

        {/* Right side actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginLeft: 32,
          }}
        >
          <div style={{ position: "relative" }}>
            <CheckInButton />
          </div>
          <Button
            variant="subtle"
            color="white"
            size="sm"
            leftSection={<IconLogout size={18} />}
            className="hover:scale-110"
            style={{
              minWidth: 100,
              fontWeight: 500,
              backgroundColor: "rgba(150, 47, 47, 0.93)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#dc2626", // red-600
              },
            }}
            onClick={handleLogout}
            visibleFrom="sm"
          >
            Logout
          </Button>
          <Burger
            opened={opened}
            onClick={() => {
                setOpened(!opened);
            }}
            hiddenFrom="xs"
            size="sm"
            color="#333"
            style={{ marginLeft: 4 }}
          />
        </div>
      </Container>

      {/* Mobile menu overlay */}
      {opened && (
        <Paper
          className={`w-[50%] right-3 transition-transform duration-300 ease-in-out ${
            opened ? "translate-x-0" : "translate-x-full"
          }`}
          shadow="md"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            zIndex: 100,
            background: "#fff",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            maxHeight: opened ? "500px" : "0",
            overflow: "hidden",
            pointerEvents: opened ? "auto" : "none", // Disable interaction when closed
          }}
        >
          <div style={{ padding: "24px" }} className="md:hidden">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    position: "relative",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    background:
                      active === item.props.to
                        ? "rgba(0,0,0,0.03)"
                        : "transparent",
                  }}
                >
                  {React.cloneElement(item, {
                    style: {
                      fontSize: "1.1rem",
                      fontWeight: 500,
                      color: active === item.props.to ? "#030b12" : "#333",
                    },
                  })}
                </div>
              ))}
              <div
                style={{
                  height: 1,
                  background: "rgba(0,0,0,0.06)",
                  margin: "8px 0",
                }}
              />
              <CheckInButton />
              <Button
                color="white"
                size="md"
                leftSection={<IconLogout size={18} />}
                style={{
                  backgroundColor: "red",
                }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </Paper>
      )}
    </header>
  );
}

function CheckInButton() {
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [recordId, setRecordId] = React.useState<number | null>(null);
  React.useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        // Get token and user id from JWT
        const token =
          window.localStorage.getItem("token") ||
          (window.document.cookie.match(/(?:^|; )token=([^;]*)/)?.[1] ?? null);
        if (!token) return setLoading(false);
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;
        // Fetch latest office_in_out for user
        const res = await fetch(`/api/office-in-out`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return setLoading(false);
        interface OfficeRecord {
          id: number;
          user_id: number;
          in_time: string | null;
          out_time: string | null;
          remarks: string;
          on_off: number;
        }
        const allRecords: OfficeRecord[] = await res.json();
        const userRecords = allRecords.filter(
          (r) => String(r.user_id) === String(userId)
        );
        // Get latest record
        if (userRecords.length > 0) {
          const latest = userRecords[userRecords.length - 1];
          setCheckedIn(latest.on_off === 1);
          setRecordId(latest.id);
        } else {
          setCheckedIn(false);
          setRecordId(null);
        }
      } catch {
        setCheckedIn(false);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleClick = async () => {
    setLoading(true);
    try {
      const token =
        window.localStorage.getItem("token") ||
        (window.document.cookie.match(/(?:^|; )token=([^;]*)/)?.[1] ?? null);
      if (!token) {
        notifyError("No token found. Please login again.");
        setLoading(false);
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;
      const now = new Date();
      // Format time as HH:mm:ss for backend
      const timeStr = now.toTimeString().slice(0, 8);
      let res;
      if (!checkedIn) {
        // Check In: create new record
        res = await fetch(`/api/office-in-out`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userId,
            in_time: timeStr,
            out_time: null,
            remarks: "",
            on_off: 1,
          }),
        });
        if (res.ok) {
          setCheckedIn(true);
          notifySuccess("Checked in successfully");
        } else {
          const err = await res.json().catch(() => ({}));
          notifyError("Check-in failed: " + (err.message || res.status));
          console.error("Check-in error:", err);
        }
      } else {
        // Check Out: update latest record
        if (!recordId) {
          notifyError("No check-in record found.");
          setLoading(false);
          return;
        }
        res = await fetch(`/api/office-in-out/${recordId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: userId,
            in_time: null,
            out_time: timeStr,
            remarks: "",
            on_off: 0,
          }),
        });
        if (res.ok) {
          setCheckedIn(false);
          notifySuccess("Checked out successfully");
        } else {
          const err = await res.json().catch(() => ({}));
          notifyError("Check-out failed: " + (err.message || res.status));
          console.error("Check-out error:", err);
        }
      }
    } catch (error) {
      notifyError(
        "Error: " + (error instanceof Error ? error.message : String(error))
      );
      console.error("Button error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      leftSection={
        checkedIn ? (
          <IconLogout size={16} style={{ color: "#e11d48" }} />
        ) : (
          <IconLogin size={16} style={{ color: "#059669" }} />
        )
      }
      variant={checkedIn ? "light" : "filled"}
      color={checkedIn ? "red" : "green"}
      onClick={handleClick}
      size="xs"
      loading={loading}
      style={{
        minWidth: 90,
        height: 32,
        fontWeight: 600,
        fontSize: "0.95rem",
        borderRadius: 6,
        boxShadow: "none",
        padding: "0 12px",
        margin: 0,
      }}
    >
      {checkedIn ? "Check Out" : "Check In"}
    </Button>
  );
}
