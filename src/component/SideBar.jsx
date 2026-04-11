import React, { useState } from "react";
import {
  Box,
  Fab,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
  sidebarClasses,
} from "react-pro-sidebar";
import { Link, useNavigate } from "react-router-dom";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";

import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CategoryIcon from "@mui/icons-material/Category";
import { tokenTheme } from "../theme";
import { UseAuth } from "../Api/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Chip from "@mui/material/Chip";
import CalendarMonthSharpIcon from "@mui/icons-material/CalendarMonthSharp";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";

const Item = ({ title, to, icon, selected, setSelected, onClick }) => {
  const navigate = useNavigate();
  return (
    <MenuItem
      onClick={() => {
        setSelected(title);
        if (onClick) onClick();
        else if (to) navigate(to);
      }}
      active={selected === title}
      component={to ? <Link to={to} /> : undefined}
      icon={icon}
    >
      {title}
    </MenuItem>
  );
};

const SubMenuItem = ({
  title,
  icon,
  subItems,
  selected,
  setSelected,
  auth,
  label,
}) => {
  const navigate = useNavigate();
  const visibleSubItems = subItems.filter((item) =>
    item.role.some((r) => auth.role.includes(r)),
  );
  return (
    <SubMenu title={title} icon={icon} label={label}>
      {visibleSubItems.map((subItem) => (
        <MenuItem
          key={subItem.title}
          active={selected === subItem.title}
          onClick={() => {
            setSelected(subItem.title);
            navigate(subItem.to);
          }}
          // icon={<AddIcon />}
        >
          {subItem.title}
        </MenuItem>
      ))}
    </SubMenu>
  );
};

function SideBar() {
  const [selected, setSelected] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const theme = useTheme();
  const colors = tokenTheme(theme.palette.mode);
  const { auth, logout } = UseAuth();
  console.log("auth dashboard:", auth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const configMenu = [
    {
      role: ["super_admin", "admin_club", "instructeur", "parent", "secretary"],
      title: "Accueil",
      to: "/",
      icon: <HomeOutlinedIcon />,
    },
    {
      role: ["super_admin", "admin_club", "instructeur", "parent", "secretary"],
      title: "dashboard",
      to: "/dashboard",
      icon: <ShoppingBagIcon />,
    },
    {
      role: ["super_admin", "admin_club", "instructeur", "parent", "secretary"],
      title: "Eleves",
      to: "/dashboard/student/list",
      icon: <PeopleOutlineOutlinedIcon />,
    },

    {
      role: ["super_admin"],
      title: "Plans",
      to: "/dashboard/plan/store",
      icon: <ShoppingBagIcon />,
    },

    {
      role: ["super_admin", "admin_club", "instructeur", "parent", "secretary"],
      title: "Membres du club",
      to: "/dashboard/member/list",
      icon: <PeopleOutlineOutlinedIcon />,
    },

    {
      role: ["super_admin", "admin_club", "instructeur", "secretary"],
      title: "Ajouts",
      label: "Ajouts",
      icon: <AddIcon />,
      subItems: [
        {
          role: ["super_admin", "admin_club", "instructeur"],
          title: "cours",
          to: "/dashboard/course/store",
        },

        {
          role: ["super_admin", "admin_club"],
          title: "médaille",
          to: "/dashboard/medal/store",
        },

        {
          role: ["super_admin", "admin_club", "instructeur"],
          title: "grade",
          to: "/dashboard/grade/store",
        },
        {
          role: ["super_admin", "admin_club", "instructeur"],
          title: "mérite",
          to: "/dashboard/student/grade/store",
        },
      ],
    },
    {
      role: ["super_admin", "admin_club", "parent", "instructeur", "secretary"],
      title: "Présence",
      to: "/dashboard/student/attendance",
      icon: <CheckCircleOutlineIcon />,
    },
    {
      role: ["super_admin", "admin_club", "parent", "instructeur", "secretary"],
      title: "Settings",
      to: "/settings",
      icon: <SettingsIcon />,
    },
    {
      role: ["super_admin", "admin_club", "parent", "instructeur", "secretary"],
      title: "FAQ",
      to: "/faq",
      icon: <HelpOutlineIcon />,
    },
    {
      role: ["super_admin", "admin_club", "parent", "instructeur", "secretary"],
      title: "Logout",
      onClick: handleLogout,
      icon: <LogoutIcon />,
    },
  ];

  const visibleMenu = configMenu.filter((item) =>
    item.role.some((r) => auth.role.includes(r)),
  );

  return (
    <Box position={"relative"}>
      <Sidebar
        collapsed={isCollapsed}
        rootStyles={{
          [`.${sidebarClasses.container}`]: {
            height: "100vh",
            overflowY: "auto",
            position: "fixed",
            width: isCollapsed ? "80px" : "250px",
            backgroundColor: theme.palette.background.default,
          },
        }}
      >
        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              color: colors.gray[100],
              backgroundColor: active ? colors.zinc[500] : "transparent",
              "&:hover": {
                color: colors.gray[100],
                backgroundColor: colors.primary[400],
              },
            }),
          }}
        >
          <MenuItem
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {!isCollapsed && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography>Dashboard</Typography>
                <IconButton>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>
          {!isCollapsed && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 2,
              }}
            >
              <img
                src="https://sm.ign.com/ign_pk/cover/a/avatar-gen/avatar-generations_rpge.jpg"
                alt=""
                style={{ width: "100px", height: "100px", borderRadius: "50%" }}
              />
              <Typography variant="h6">{auth?.user?.fullname}</Typography>
              <Chip label={<Typography>{auth?.user?.role?.name}</Typography>} />
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? 0 : 5}>
            {visibleMenu.map((item) =>
              item.subItems ? (
                <SubMenuItem
                  label={item.label}
                  key={item.title}
                  title={item.title}
                  icon={item.icon}
                  subItems={item.subItems}
                  selected={selected}
                  setSelected={setSelected}
                  auth={auth}
                />
              ) : (
                <Item
                  key={item.title}
                  onClick={item.onClick}
                  title={item.title}
                  to={item.to}
                  icon={item.icon}
                  selected={selected}
                  setSelected={setSelected}
                />
              ),
            )}
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
}

export default SideBar;
