import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import FriendRequestModal from "./FriendRequestModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [requestStatuses, setRequestStatuses] = useState({});

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
    friendRequests,
    friendNotifications,
    setFriendNotifications,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({ title: "Please Enter something in search", status: "warning", duration: 5000, isClosable: true, position: "top-left" });
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
      const statuses = {};
      await Promise.all(
        data.map(async (u) => {
          const res = await axios.get(`/api/friend/status/${u._id}`, config);
          statuses[u._id] = res.data;
        })
      );
      setRequestStatuses(statuses);
    } catch (error) {
      toast({ title: "Error Occured!", description: "Failed to Load the Search Results", status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      await axios.post("/api/friend/send", { receiverId: userId }, config);
      setRequestStatuses((prev) => ({ ...prev, [userId]: { status: "pending" } }));
      toast({ title: "Friend request sent", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: error.response?.data?.message || "Failed to send request", status: "error", duration: 3000, isClosable: true });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = { headers: { "Content-type": "application/json", Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({ title: "Error fetching the chat", description: error.response?.data?.message || error.message, status: "error", duration: 5000, isClosable: true, position: "bottom-left" });
      setLoadingChat(false);
    }
  };

  const getActionButton = (u) => {
    const info = requestStatuses[u._id];
    if (!info || info.status === "none") {
      return <Button size="xs" colorScheme="teal" onClick={() => handleSendRequest(u._id)}>Add Friend</Button>;
    }
    if (info.status === "pending") {
      return <Button size="xs" isDisabled colorScheme="yellow">Pending</Button>;
    }
    if (info.status === "accepted") {
      return <Button size="xs" colorScheme="blue" onClick={() => accessChat(u._id)}>Message</Button>;
    }
    return null;
  };

  return (
    <>
      <Box d="flex" justifyContent="space-between" alignItems="center" bg="white" w="100%" p="5px 10px 5px 10px" borderWidth="5px">
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text d={{ base: "none", md: "flex" }} px={4}>Search User</Text>
          </Button>
        </Tooltip>
        <Box display="flex" alignItems="center" gap={2}>
          <img src="/65747160269.jpg" alt="HiFi logo" style={{ height: "36px", width: "36px", objectFit: "contain" }} />
          <Text fontSize="2xl" fontFamily="Work sans">HiFi</Text>
        </Box>
        <div>
          <FriendRequestModal>
            <Tooltip label="Friend Requests" hasArrow placement="bottom">
              <Button variant="ghost" p={1}>
                <NotificationBadge count={friendRequests.length} effect={Effect.SCALE} />
                <i className="fas fa-user-plus" style={{ fontSize: "18px" }}></i>
              </Button>
            </Tooltip>
          </FriendRequestModal>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge count={notification.length + friendNotifications.length} effect={Effect.SCALE} />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && !friendNotifications.length && "No New Messages"}
              {friendNotifications.map((n) => (
                <MenuItem
                  key={n.id}
                  onClick={() => setFriendNotifications((prev) => prev.filter((x) => x.id !== n.id))}
                >
                  🤝 {n.message}
                </MenuItem>
              ))}
              {notification.map((notif) => (
                <MenuItem key={notif._id} onClick={() => { setSelectedChat(notif.chat); setNotification(notification.filter((n) => n !== notif)); }}>
                  {notif.chat.isGroupChat ? `New Message in ${notif.chat.chatName}` : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}><MenuItem>My Profile</MenuItem></ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input placeholder="Search by name or email" mr={2} value={search} onChange={(e) => setSearch(e.target.value)} />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((u) => (
                <Box key={u._id} display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box flex="1">
                    <UserListItem user={u} handleFunction={() => {}} />
                  </Box>
                  <Box ml={2}>{getActionButton(u)}</Box>
                </Box>
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
