import React, { useState, useEffect } from "react";
import { Flex, Button, Text, Link, VStack, Spinner } from "@chakra-ui/react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import OneCard from "../items/OneCard.tsx";
import Card from "../classes/Card.ts";
import CardList from "../classes/CardList.ts";

interface CardData {
  id: string;
  question: string;
  answer: string;
  card_list_id: string;
  user_id: string;
}

const Cards: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();        
  const location = useLocation();
  const [cardList, setCardList] = useState<CardList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(location.state?.title || "");

  useEffect(() => {
    if (id) {
      fetchCards(id);
      if (!title) fetchCardListTitle(id);
    }
  }, [id]);

  const fetchCards = async (cardListId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`/cards/card_list/${cardListId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch cards");
      const cardsData: CardData[] = await response.json();
      const cards = cardsData.map(
        (card) => new Card(card.id, card.question, card.answer, card.card_list_id, card.user_id)
      );
      setCardList(new CardList(cardListId, title, cards));
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCardListTitle = async (cardListId: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`/card_lists/${cardListId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
      }
    } catch (error) {
      console.error("Error fetching title:", error);
    }
  };

  const handleBackToHistory = () => navigate("/history");
  const handleChangeAccount = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    navigate("/login");
  };

  const pageTitle = title ? `${title} | Карточки для запоминания` : "Карточки | Генератор карточек";
  const pageDescription = title
    ? `Просмотр карточек по теме "${title}". ${cardList?.cards.length || 0} карточек для изучения.`
    : "Изучайте карточки, созданные из текста или файлов. Удобный способ запоминания информации.";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={`${window.location.origin}/cards/${id}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`${window.location.origin}/cards/${id}`} />
      </Helmet>
      <Flex minH="100vh" w="100%" bg="rgb(240, 240, 240)" flexDirection="column">
        <header>
          <Flex h="6vh" w="100%" justifyContent="center" alignItems="center">
            <Flex h="100%" w="60%">
              <Link fontSize={16} color="rgb(4, 120, 87)" p={2} onClick={handleChangeAccount} cursor="pointer">
                Change account
              </Link>
              <Link fontSize={16} color="rgb(4, 120, 87)" p={2} ml="auto" onClick={handleBackToHistory} cursor="pointer">
                To history
              </Link>
            </Flex>
          </Flex>
        </header>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "1rem" }}>
          <Flex flexDirection="column" alignItems="center" mt={6}>
            <Text as="h1" fontSize={24} color="rgb(40,40,40)}">
              {isLoading ? "Загрузка..." : title || "Карточки"}
            </Text>
          </Flex>
          {isLoading ? (
            <Spinner size="xl" color="rgb(4,120,87)" mt={10} />
          ) : cardList && cardList.cards.length > 0 ? (
            <VStack w="100%" overflowY="auto" gap={4} mt={8} px={4}>
              {cardList.cards.map((card) => (
                <OneCard key={card.id} q={card.question} a={card.answer} />
              ))}
            </VStack>
          ) : (
            <Text mt={10}>Карточки не найдены</Text>
          )}
          <Button
            h="48px"
            w="140px"
            bg="rgb(4,120,87)"
            borderRadius="lg"
            mt={4}
            mb={8}
            onClick={() => navigate("/home")}
          >
            <Text textAlign="center" color="white" fontWeight={400}>
              На главную
            </Text>
          </Button>
        </main>
      </Flex>
    </>
  );
};

export default Cards;