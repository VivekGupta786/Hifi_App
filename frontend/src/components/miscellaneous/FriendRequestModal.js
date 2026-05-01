import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/modal";
import { Box, Text } from "@chakra-ui/layout";
import { Avatar } from "@chakra-ui/avatar";
import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const FriendRequestModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, friendRequests, setFriendRequests } = ChatState();
  const toast = useToast();

  const handleOpen = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get("/api/friend/requests", config);
      setFriendRequests(data);
      onOpen();
    } catch {
      toast({ title: "Failed to load requests", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}`, "Content-type": "application/json" },
      };
      await axios.put("/api/friend/accept", { requestId }, config);
      setFriendRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast({ title: "Friend request accepted", status: "success", duration: 3000, isClosable: true });
    } catch {
      toast({ title: "Failed to accept request", status: "error", duration: 3000, isClosable: true });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}`, "Content-type": "application/json" },
      };
      await axios.put("/api/friend/reject", { requestId }, config);
      setFriendRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast({ title: "Friend request rejected", status: "info", duration: 3000, isClosable: true });
    } catch {
      toast({ title: "Failed to reject request", status: "error", duration: 3000, isClosable: true });
    }
  };

  return (
    <>
      <span onClick={handleOpen} style={{ cursor: "pointer" }}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Friend Requests</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            {friendRequests.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>No pending requests</Text>
            ) : (
              friendRequests.map((req) => (
                <Box
                  key={req._id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={3}
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar size="sm" name={req.sender.name} src={req.sender.pic} mr={2} />
                    <Box>
                      <Text fontWeight="bold">{req.sender.name}</Text>
                      <Text fontSize="xs" color="gray.500">{req.sender.email}</Text>
                    </Box>
                  </Box>
                  <Box display="flex" gap={2}>
                    <Button size="sm" colorScheme="teal" onClick={() => handleAccept(req._id)}>Accept</Button>
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleReject(req._id)}>Reject</Button>
                  </Box>
                </Box>
              ))
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FriendRequestModal;
