import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendNotifications, setFriendNotifications] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);
    if (!userInfo) history.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  useEffect(() => {
    if (!user) return;
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    axios.get("/api/friend/requests", config)
      .then(({ data }) => setFriendRequests(data))
      .catch(() => {});
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        friendRequests,
        setFriendRequests,
        friendNotifications,
        setFriendNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
