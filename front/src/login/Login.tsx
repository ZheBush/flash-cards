import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Box, Text, Input, Link, Button } from "@chakra-ui/react";
import { useAuth } from "../AuthContext.tsx";
import { AuthResponse } from "../types";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isEmailCorrect, setCorrectEmail] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { login, createGuestSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);
      
      const response = await fetch('/auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include' 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data: AuthResponse = await response.json();

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);

      login({
        email,
        token: data.access_token,
        tokenType: data.token_type,
        role: data.role,
        id: data.user_id
      });
      
      navigate("/home");
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    createGuestSession();
    navigate("/home");
  };

  const changeEmail = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const changePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const submitData = async (e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(email)) {
      setCorrectEmail(true);
      await handleLogin(email, password);
    } else {
      setCorrectEmail(false);
    }
  };

  return (
    <Flex
      h="100vh"
      w="100vw"
      justify="center"
      align="center"
      bg="rgb(240, 240, 240)"
    >
      <Flex
        h="auto"
        w="30%"
        p={8}
        flexDirection="column"
        bg="white"
        borderRadius="lg"
        shadow="lg"
      >
        <Box display="flex" justifyContent="center" mb={6}>
          <Text fontSize={28} color="rgb(40, 40, 40)" fontWeight="500">
            Welcome
          </Text>
        </Box>
        
        <Flex flexDirection="column" mb={4}>
          <Text fontSize={12} color={isEmailCorrect ? "rgb(4, 120, 87)" : "rgb(232, 52, 52)"} mb={1}>
            {isEmailCorrect ? "Email" : "Incorrect email"}
          </Text>
          <Input
            type="email"
            value={email}
            onChange={changeEmail}
            placeholder="your@email.com"
            size="md"
            borderColor={isEmailCorrect ? "rgb(220, 220, 220)" : "rgb(232, 52, 52)"}
            _focus={{ borderColor: "rgb(4, 120, 87)" }}
          />
        </Flex>
        
        <Flex flexDirection="column" mb={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={1}>
            <Text fontSize={12} color="rgb(4, 120, 87)">
              Password
            </Text>
            <Link fontSize={12} color="rgb(4, 120, 87)" href="#">
              Forgot password?
            </Link>
          </Flex>
          <Input
            type="password"
            value={password}
            onChange={changePassword}
            placeholder="••••••••"
            size="md"
            borderColor="rgb(220, 220, 220)"
            _focus={{ borderColor: "rgb(4, 120, 87)" }}
          />
        </Flex>
        
        <Button
          bg="rgb(4, 120, 87)"
          color="white"
          size="lg"
          onClick={submitData}
          loading={isLoading}
          loadingText="Logging in..."
          _hover={{ bg: "rgb(24, 140, 107)" }}
          mb={4}
        >
          Log in
        </Button>

        <Button
          variant="outline"
          borderColor="rgb(4, 120, 87)"
          color="rgb(4, 120, 87)"
          size="lg"
          onClick={handleGuestLogin}
          _hover={{ bg: "rgb(240, 240, 240)" }}
          mb={4}
        >
          Continue as Guest
        </Button>
        
        <Flex justifyContent="center" alignItems="center">
          <Text color="rgb(100, 100, 100)" fontSize={14}>
            No Account?
          </Text>
          <Link
            color="rgb(4, 120, 87)"
            fontSize={14}
            fontWeight="500"
            ml={1}
            href="/register"
          >
            Register
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Login;