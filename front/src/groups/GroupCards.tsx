import React, { useState, useEffect } from "react";
import { Flex, Button, Text, Link, VStack, Box, Spinner } from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";

interface CardList {
  id: string;
  title: string;
  user_id: string;
  group_id?: string;
}

interface LocationState {
  groupId?: string;
  groupName?: string;
}

const GroupCards: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cardLists, setCardLists] = useState<CardList[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const state = location.state as LocationState;
  const groupId = state?.groupId;
  const groupName = state?.groupName;

  useEffect(() => {
    if (groupId) {
      fetchGroupCardLists(groupId);
    }
  }, [groupId]);

  const fetchGroupCardLists = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(`/groups/${id}/card_lists`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch card lists');
      }

      const data: CardList[] = await response.json();
      setCardLists(data);
    } catch (error) {
      console.error("Error fetching card lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardListClick = (cardList: CardList) => {
    navigate("/cards", { state: { cardListId: cardList.id, title: cardList.title } });
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" p={8}>
      <Text fontSize={24} mb={4}>Cards for Group: {groupName}</Text>
      <VStack gap={4} align="stretch">
        {cardLists.map(cardList => (
          <Box key={cardList.id} p={4} borderWidth="1px" borderRadius="lg" cursor="pointer" onClick={() => handleCardListClick(cardList)}>
            <Text fontWeight="bold">{cardList.title}</Text>
          </Box>
        ))}
      </VStack>
    </Flex>
  );
};

export default GroupCards;