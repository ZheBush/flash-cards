import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Flex, Box, Text, Link, Input, HStack, Button, Textarea,
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import Keyboard from "../icons/Keyboard.tsx";
import FileTxt from "../icons/FileTxt.tsx";
import FilePdf from "../icons/FilePdf.tsx";
import { LocationState } from "../types";
import { useAuth } from "../AuthContext.tsx";
import WeatherWidget from "../WeatherWidget.tsx";
import { Helmet } from 'react-helmet-async';


interface UploadResponse {
  card_list_id: string;
  title: string;
}

const API_BASE = '';

const Home: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [cardsNum, setCardsNum] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [selectedTxtFile, setSelectedTxtFile] = useState<File | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isTxtLoading, setIsTxtLoading] = useState<boolean>(false);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { user, isGuest, logout } = useAuth();
  const txtFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);

  const handleAuthClick = async (): Promise<void> => {
    if (user) {
      await logout();
    }
    navigate("/login");
  };

  const changeTitle = (e: ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };

  const changeCardsNum = (e: ChangeEvent<HTMLInputElement>): void => {
    setCardsNum(e.target.value);
  };

  const changeText = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setText(e.target.value);
  };

  const handleTxtFileClick = (): void => {
    if (!user) {
      navigate("/login");
      return;
    }
    txtFileRef.current?.click();
  };

  const handlePdfFileClick = (): void => {
    if (!user) {
      navigate("/login");
      return;
    }
    pdfFileRef.current?.click();
  };

  const handleTxtFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(file.name);
      if (!user) {
        navigate("/login");
        return;
      }
      setSelectedTxtFile(file);
    }
  };

  const handlePdfFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(file.name);
      if (!user) {
        navigate("/login");
        return;
      }
      setSelectedPdfFile(file);
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        return data.access_token;
      } else {
        await logout();
        navigate("/login");
        return null;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      await logout();
      navigate("/login");
      return null;
    }
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
    
    let token = localStorage.getItem('access_token');
    const headers = {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    let response = await fetch(fullUrl, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        const newHeaders = {
          ...options.headers,
          'Authorization': `Bearer ${newToken}`,
        };
        response = await fetch(fullUrl, {
          ...options,
          headers: newHeaders,
          credentials: 'include',
        });
      }
    }

    return response;
  };

  const uploadText = async (): Promise<void> => {

    setIsTxtLoading(true);
    try {
      if (isGuest) {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("cards_num", parseInt(cardsNum).toString());

        const response = await fetch('/card_lists/guest/upload_text', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to generate cards');
        }

        const data = await response.json();
        
        navigate("/cards", {
          state: {
            cards: data.cards,
            title: title
          } as LocationState
        });
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("cards_num", parseInt(cardsNum).toString());
        
        const textBlob = new Blob([text], { type: 'text/plain' });
        const textFile = new File([textBlob], 'text.txt', { type: 'text/plain' });
        formData.append("file", textFile);

        const response = await authenticatedFetch('/card_lists/upload_txt', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload text');
        }

        const data: UploadResponse = await response.json();

        navigate("/cards", {
          state: {
            cardListId: data.card_list_id,
            title: data.title
          } as LocationState
        });
      }

      setTitle("");
      setCardsNum("");
      setText("");
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsTxtLoading(false);
    }
  };

  const uploadTxtFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    
    setIsTxtLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("cards_num", parseInt(cardsNum).toString());
      formData.append("file", file);

      const response = await authenticatedFetch('/card_lists/upload_txt', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data: UploadResponse = await response.json();

      navigate("/cards", {
        state: {
          cardListId: data.card_list_id,
          title: data.title
        } as LocationState
      });

      setTitle("");
      setCardsNum("");
      setSelectedTxtFile(null);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsTxtLoading(false);
    }
  };

  const uploadPdfFile = async (file: File | null): Promise<void> => {
    if (!file) return;
    
    setIsPdfLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("cards_num", parseInt(cardsNum).toString());
      formData.append("file", file);

      const response = await authenticatedFetch('/card_lists/upload_pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data: UploadResponse = await response.json();

      navigate("/cards", {
        state: {
          cardListId: data.card_list_id,
          title: data.title
        } as LocationState
      });

      setTitle("");
      setCardsNum("");
      setSelectedPdfFile(null);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const location = useLocation();
  const canonicalUrl = `${window.location.origin}${location.pathname}`;

  return (

    <Flex
      minH="100vh"
      w="100%"
      bg="rgb(240, 240, 240)"
      flexDirection="column"
    >

      <Helmet>
        <title>Генератор карточек</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta 
          name="description" 
          content="Сервис для создания учебных карточек из текста, TXT или PDF. Генерируй карточки быстро и бесплатно." />
        <meta 
          property="og:title" 
          content="Генератор карточек – учись с удовольствием" />
        <meta 
          property="og:description" 
          content="Создавайте карточки для запоминания из текста, TXT или PDF. Бесплатно, без регистрации (гостевой режим)." />
        <meta 
          property="og:image" 
          content="https://fleshcards.com/og-home.png" />
        <meta 
          property="og:url" 
          content="https://fleshcards.com/" />
        <meta 
          name="twitter:card" 
          content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Cards Generator",
            "description": "Создание карточек в формате 'вопрос-ответ'",
            "url": "https://yourdomain.com",
          })}
        </script>
      </Helmet>

      <Flex
        h="6vh"
        w="100%"
        justifyContent="center"
        alignItems="start"
        bg="rgb(240, 240, 240)"
      >
        <Flex justifyContent="space-between" alignItems="start">
          <WeatherWidget />
        </Flex>
        <Flex
          h="6vh"
          w="100%"
          justifyContent="center"
          alignItems="center"
          bg="rgb(240, 240, 240)"
        >
          <Flex h="100%" w="60%" alignItems="center">
            <Link
              fontSize={16}
              color="rgb(4, 120, 87)"
              p={2}
              onClick={handleAuthClick}
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
            >
              {user ? (isGuest ? "Guest" : "Log out") : "Log in / Register"}
            </Link>
            <Flex ml="auto" gap={4}>
              {user && !isGuest && (
                <Link
                  fontSize={16}
                  color="rgb(4, 120, 87)"
                  p={2}
                  href="/history"
                  _hover={{ textDecoration: "underline" }}
                >
                  To history
                </Link>
              )}
              {user && !isGuest && user.role === 'manager' && (
                <Link
                  fontSize={16}
                  color="rgb(4, 120, 87)"
                  p={2}
                  href="/groups"
                  _hover={{ textDecoration: "underline" }}
                >
                  Manage Groups
                </Link>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      
      <Flex
        flex="1"
        w="100%"
        bg="rgb(240, 240, 240)"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        py={8}
      >
        <Flex
          w="40%"
          bg="white"
          p={8}
          borderRadius="lg"
          shadow="md"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          mb={8}
        >
          
          <Text fontSize={24} color="rgb(40, 40, 40)" mb={6} fontWeight="500">
            Create New Cards
          </Text>
          
          <Flex w="100%" flexDirection="column">
            <Input
              value={title}
              onChange={changeTitle}
              size="md"
              placeholder="Title"
              borderColor="rgb(220, 220, 220)"
              mb={4}
              _focus={{
                bg: "white",
                borderColor: "rgb(4, 120, 87)"
              }}
            />
            <Input
              value={cardsNum}
              onChange={changeCardsNum}
              size="md"
              placeholder="Number of cards"
              type="number"
              min="1"
              max="20"
              borderColor="rgb(220, 220, 220)"
              _focus={{
                bg: "white",
                borderColor: "rgb(4, 120, 87)"
              }}
            />
          </Flex>
        </Flex>

        <Flex w="100%" justifyContent="center" alignItems="center">
          <HStack gap={8} justifyContent="center" alignItems="stretch" flexWrap="wrap">
            <Flex
              w="300px"
              bg="white"
              shadow="md"
              borderRadius="lg"
              alignItems="center"
              flexDirection="column"
              p={6}
            >
              <Keyboard />
              <Text fontSize={18} fontWeight="500" color="rgb(40,40,40)" mt={4} mb={2}>
                From Text
              </Text>
              <Textarea
                h="150px"
                w="100%"
                py = "65px"
                value={text}
                onChange={changeText}
                placeholder="Enter your text here..."
                textAlign="center"
                display="flex"
                alignItems="center"
                justifyContent="center"
                resize="none"
                borderColor="rgb(220,220,220)"
                _focus={{ borderColor: "rgb(4,120,87)" }}
              />
              <Button
                w="100%"
                bg="rgb(4, 120, 87)"
                color="white"
                mt={4}
                onClick={uploadText}
                loading={isTxtLoading}
                loadingText="Generating..."
                _hover={{ bg: "rgb(24, 140, 107)" }}
              >
                Generate
              </Button>
            </Flex>

            <Flex
              w="300px"
              bg="white"
              shadow="md"
              borderRadius="lg"
              alignItems="center"
              flexDirection="column"
              p={6}
            >
              <Input
                type="file"
                ref={txtFileRef}
                onChange={handleTxtFileChange}
                accept=".txt"
                display="none"
              />
              <FileTxt />
              <Text fontSize={18} fontWeight="500" color="rgb(40,40,40)" mt={4} mb={2}>
                From TXT File
              </Text>
              <Button
                w="100%"
                h="150px"
                onClick={handleTxtFileClick}
                variant="outline"
                borderColor="rgb(220, 220, 220)"
                color="rgb(4,120,87)"
                _hover={{ bg: "rgb(240,240,240)" }}
                mb={2}
                disabled={!user}
              >
                <Text textAlign="center" fontSize={14} fontWeight="400" color="rgb(150, 150, 150)">
                  {selectedTxtFile ? selectedTxtFile.name : "Choose TXT file"}
                </Text>
              </Button>
              <Button
                w="100%"
                bg="rgb(4, 120, 87)"
                color="white"
                onClick={() => uploadTxtFile(selectedTxtFile)}
                loading={isTxtLoading}
                loadingText="Generating..."
                disabled={!selectedTxtFile}
                _hover={{ bg: "rgb(24, 140, 107)" }}
              >
                Generate
              </Button>
            </Flex>

            <Flex
              w="300px"
              bg="white"
              shadow="md"
              borderRadius="lg"
              alignItems="center"
              flexDirection="column"
              p={6}
            >
              <Input
                type="file"
                ref={pdfFileRef}
                onChange={handlePdfFileChange}
                accept=".pdf"
                display="none"
              />
              <FilePdf />
              <Text fontSize={18} fontWeight="500" color="rgb(40,40,40)" mt={4} mb={2}>
                From PDF File
              </Text>
              <Button
                w="100%"
                h="150px"
                onClick={handlePdfFileClick}
                variant="outline"
                borderColor="rgb(220, 220, 220)"
                color="rgb(4,120,87)"
                _hover={{ bg: "rgb(240,240,240)" }}
                mb={2}
                disabled={!user}
              >
                <Text textAlign="center" fontSize={14} fontWeight="400" color="rgb(150, 150, 150)">
                  {selectedPdfFile ? selectedPdfFile.name : "Choose PDF file"}
                </Text>
              </Button>
              <Button
                w="100%"
                bg="rgb(4, 120, 87)"
                color="white"
                onClick={() => uploadPdfFile(selectedPdfFile)}
                loading={isPdfLoading}
                loadingText="Generating..."
                disabled={!selectedPdfFile}
                _hover={{ bg: "rgb(24, 140, 107)" }}
              >
                Generate
              </Button>
            </Flex>
          </HStack>
        </Flex>
        
        {isGuest && (
          <Flex
            mt={8}
            p={4}
            bg="blue.50"
            borderRadius="lg"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="blue.600" fontSize={14}>
              You're in guest mode. Cards won't be saved. 
              <Link onClick={() => navigate("/login")} color="blue.800" fontWeight="bold" ml={1}>
                Login or Register
              </Link>
              {' '}to save your cards.
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default Home;