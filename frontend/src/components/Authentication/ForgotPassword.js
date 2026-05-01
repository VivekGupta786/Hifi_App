import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack, Text } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/react";

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleReset = async () => {
    if (!email || !newPassword || !confirmPassword) {
      toast({ title: "Please fill all fields", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", status: "error", duration: 3000, isClosable: true });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { "Content-type": "application/json" } };
      await axios.post("/api/user/reset-password", { email, newPassword }, config);
      toast({ title: "Password reset successful! Please login.", status: "success", duration: 4000, isClosable: true });
      onBack();
    } catch (error) {
      toast({ title: error.response?.data?.message || "Reset failed", status: "error", duration: 4000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing="10px">
      <Text fontWeight="bold" fontSize="lg">Reset Password</Text>
      <FormControl isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input type="email" placeholder="Enter your registered email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>New Password</FormLabel>
        <InputGroup size="md">
          <Input type={show ? "text" : "password"} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </FormControl>
      <Button colorScheme="blue" width="100%" onClick={handleReset} isLoading={loading}>
        Reset Password
      </Button>
      <Button variant="link" size="sm" onClick={onBack}>
        Back to Login
      </Button>
    </VStack>
  );
};

export default ForgotPassword;
