import React, { useState, ChangeEvent, FormEvent } from "react";
import { Flex, Box, Text, Input, Button, Link, NativeSelect } from "@chakra-ui/react";
import { useAuth } from "../AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "../types";

interface RegisterResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: string;
}

const Register: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [isEmailCorrect, setCorrectEmail] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [role, setRole] = useState<"user" | "manager">("user");
  const [isPasswordConfirmed, setPasswordConfirmed] = useState<boolean>(true);
  const [isUserExists, setIsUserExists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const register = async (email: string, password: string, role: "user" | "manager"): Promise<RegisterResponse | null> => {
    setIsLoading(true);
    setIsUserExists(false);

    try {
      console.log(role)
      const registerResponse = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role
        })
      });

      const registerData = await registerResponse.json();
      console.log('Register response:', registerData);

      if (!registerResponse.ok) {
        if (registerResponse.status === 400) {
          if (registerData.detail && registerData.detail.includes("User already exists")) {
            setIsUserExists(true);
            setIsLoading(false);
            return null;
          }
        }
        throw new Error(registerData.detail || 'Registration failed');
      }

      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await fetch('/auth/login', {
        method: 'POST',
        body: formData 
      });

      console.log('Login response status:', loginResponse.status);

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('Login data:', loginData);

        localStorage.setItem('access_token', loginData.access_token);
        localStorage.setItem('token_type', loginData.token_type);

        login({
          email,
          token: loginData.access_token,
          tokenType: loginData.token_type,
          role: loginData.role,
          id: loginData.user_id
        });

        navigate("/home");
      } else {
        const errorText = await loginResponse.text();
        console.error('Login failed:', errorText);

        try {
          const errorData = JSON.parse(errorText);
          alert(`Login failed: ${errorData.detail || 'Unknown error'}`);
        } catch {
          alert(`Login failed: ${errorText}`);
        }

        navigate("/login");
      }

      return registerData;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Registration failed. Please try again.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const changeEmail = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
    setIsUserExists(false);
    setCorrectEmail(true);
  };

  const changePassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
    setPasswordConfirmed(true);
  };

  const changeConfirmPassword = (e: ChangeEvent<HTMLInputElement>): void => {
    setConfirmPassword(e.target.value);
    setPasswordConfirmed(true);
  };

  const changeRole = (e: ChangeEvent<HTMLSelectElement>): void => {
    setRole(e.target.value as "user" | "manager");
  };

  const submitData = async (e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    e.preventDefault();

    setCorrectEmail(true);
    setPasswordConfirmed(true);
    setIsUserExists(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setCorrectEmail(false);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordConfirmed(false);
      return;
    }

    await register(email, password, role);
  };

  return (
    <Flex
      h="100vh"
      w="100wh"
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
        <Box
          display="flex"
          justifyContent="center"
          mb={6}
        >
          <Text fontSize={28} color="rgb(40, 40, 40)" fontWeight="500">
            Register
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
          />
        </Flex>

        <Flex flexDirection="column" mb={4}>
          <Text fontSize={12} color="rgb(4, 120, 87)" mb={1}>
            Password
          </Text>
          <Input
            type="password"
            value={password}
            onChange={changePassword}
            placeholder="••••••••"
            size="md"
            borderColor={isPasswordConfirmed ? "rgb(220, 220, 220)" : "rgb(232, 52, 52)"}
          />
        </Flex>

        <Flex flexDirection="column" mb={4}>
          <Text fontSize={12} color="rgb(4, 120, 87)" mb={1}>
            Confirm password
          </Text>
          <Input
            type="password"
            value={confirmPassword}
            onChange={changeConfirmPassword}
            placeholder="••••••••"
            size="md"
            borderColor={isPasswordConfirmed ? "rgb(220, 220, 220)" : "rgb(232, 52, 52)"}
          />
          {!isPasswordConfirmed && (
            <Text fontSize={12} color="rgb(232, 52, 52)" mt={1}>
              Passwords do not match
            </Text>
          )}
        </Flex>

        <Flex flexDirection="column" mb={6}>
          <Text fontSize={12} color="rgb(4, 120, 87)" mb={1}>
            Account type
          </Text>
          <NativeSelect.Root>
            <NativeSelect.Field 
              value={role} 
              onChange={changeRole}
              borderColor="rgb(220, 220, 220)"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Flex>

        {isUserExists && (
          <Text color="rgb(232, 52, 52)" fontSize={14} textAlign="center" mb={4}>
            User with this email already exists
          </Text>
        )}

        <Button
          bg="rgb(4, 120, 87)"
          color="white"
          size="lg"
          onClick={submitData}
          loading={isLoading}
          loadingText="Creating account"
          _hover={{ bg: "rgb(24, 140, 107)" }}
          mb={4}
        >
          Create account
        </Button>

        <Flex justifyContent="center" alignItems="center">
          <Text color="rgb(100, 100, 100)" fontSize={14}>
            Already have an account?
          </Text>
          <Link color="rgb(4, 120, 87)" fontSize={14} ml={1} href="/login">
            Log in
          </Link>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Register;