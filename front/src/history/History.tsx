import React, { useState, useEffect } from "react";
import {
  Flex, Button, Text, Link, Grid, GridItem, HStack, Spinner,
  Input, Select, Box
} from "@chakra-ui/react";
import { useNavigate, useLocation } from "react-router-dom";
import CardList from "../classes/CardList.ts";
import OneHistoryCard from "../items/OneHistoryCard.tsx";
import { useQueryParams } from "../hooks/useQueryParams.ts";
import { Helmet } from "react-helmet-async";

interface CardListData {
  id: string;
  title: string;
  cards: any[];
  group_id?: string;
  created_at?: string;
}

interface Group {
  id: string;
  name: string;
}

const DEFAULT_FILTERS = {
  search: "",
  group_id: "",
  date_from: "",
  date_to: "",
  sort_by: "created_at",
  order: "desc",
  page: 1,
  per_page: 10,
};

const History: React.FC = () => {
  const navigate = useNavigate();
  
  // Параметры фильтрации из URL
  const [filters, setFilters] = useQueryParams(DEFAULT_FILTERS);

  const [history, setHistory] = useState<CardList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLogged(!!token);
    fetchGroups();
  }, []);

  useEffect(() => {
    if (isLogged) {
      fetchHistory();
    }
  }, [filters, isLogged]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const response = await fetch('/groups/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate("/login");
        return;
      }

      // Формируем query string
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.group_id) queryParams.append('group_id', filters.group_id);
      if (filters.date_from) queryParams.append('date_from', filters.date_from);
      if (filters.date_to) queryParams.append('date_to', filters.date_to);
      queryParams.append('sort_by', filters.sort_by);
      queryParams.append('order', filters.order);
      queryParams.append('page', String(filters.page));
      queryParams.append('per_page', String(filters.per_page));

      const response = await fetch(`/card_lists/?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch cards');

      const data = await response.json();
      // Предполагаем, что бэкенд возвращает { items: CardList[], total: number, pages: number }
      const cardLists = data.items.map((item: CardListData) =>
        new CardList(item.id, item.title, item.cards)
      );
      setHistory(cardLists);
      setTotalPages(data.pages);
      setTotalItems(data.total);
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      group_id: "",
      date_from: "",
      date_to: "",
      sort_by: "created_at",
      order: "desc",
      page: 1,
      per_page: 10,
    });
  };

  const changePage = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          size="sm"
          bg={filters.page === i ? "rgb(4, 120, 87)" : "rgb(240, 240, 240)"}
          outline="1px solid"
          outlineColor="rgb(4, 120, 87)"
          color={filters.page === i ? "white" : "rgb(4, 120, 87)"}
          onClick={() => changePage(i)}
        >
          {i}
        </Button>
      );
    }
    return (
      <HStack spaceX={2} mt={4}>
        <Button
          size="sm"
          bg="rgb(240,240,240)"
          outline="1px solid"
          outlineColor="rgb(4,120,87)"
          color="rgb(4,120,87)"
          onClick={() => changePage(filters.page - 1)}
          disabled={filters.page <= 1}
        >
          &laquo;
        </Button>
        {pages}
        <Button
          size="sm"
          bg="rgb(240,240,240)"
          outline="1px solid"
          outlineColor="rgb(4,120,87)"
          color="rgb(4,120,87)"
          onClick={() => changePage(filters.page + 1)}
          disabled={filters.page >= totalPages}
        >
          &raquo;
        </Button>
      </HStack>
    );
  };

  const location = useLocation();
  const canonicalUrl = `${window.location.origin}${location.pathname}`;

  return (
    <Flex minH="100vh" w="100%" bg="rgb(240, 240, 240)" flexDirection="column">

      <Helmet>
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      {/* Верхняя панель */}
      <Flex h="6vh" w="100%" justifyContent="center" alignItems="center">
        <Flex h="100%" w="60%">
          <Link fontSize={16} color="rgb(4, 120, 87)" p={2} href="/login">
            {isLogged ? "Log out" : "Log in"}
          </Link>
          <Link fontSize={16} color="rgb(4, 120, 87)" p={2} ml="auto" href="/home">
            To home
          </Link>
        </Flex>
      </Flex>

      {/* Основной контент */}
      <Flex flex="1" flexDirection="column" alignItems="center" p={4}>
        <Text fontSize={28} fontWeight="500" color="rgb(40,40,40)" mb={6}>
          History
        </Text>

        {/* Панель фильтров */}
        <Flex
          direction={{ base: "column", md: "row" }}
          wrap="wrap"
          gap={4}
          alignItems="flex-end"
          bg="white"
          p={4}
          borderRadius="lg"
          shadow="md"
          mb={6}
          w="100%"
          maxW="1200px"
        >
          <Box flex="1" minW="150px">
            <Text fontSize="sm" mb={1}>Search by title</Text>
            <Input
              placeholder="Title..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
              size="sm"
            />
          </Box>
          <Box flex="1" minW="150px">
            <Text fontSize="sm" mb={1}>Group</Text>
            <select
              value={filters.group_id}
              onChange={(e) => setFilters({ group_id: e.target.value, page: 1 })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">All groups</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </Box>
          <Box flex="1" minW="150px">
            <Text fontSize="sm" mb={1}>From date</Text>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ date_from: e.target.value, page: 1 })}
              size="sm"
            />
          </Box>
          <Box flex="1" minW="150px">
            <Text fontSize="sm" mb={1}>To date</Text>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ date_to: e.target.value, page: 1 })}
              size="sm"
            />
          </Box>
          <Box flex="0.5" minW="120px">
            <Text fontSize="sm" mb={1}>Sort by</Text>
            <select
              value={filters.sort_by}
              onChange={(e) => setFilters({ sort_by: e.target.value, page: 1 })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="created_at">Date</option>
              <option value="title">Title</option>
            </select>
          </Box>
          <Box flex="0.5" minW="120px">
            <Text fontSize="sm" mb={1}>Order</Text>
            <select
              value={filters.order}
              onChange={(e) => setFilters({ order: e.target.value, page: 1 })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </Box>
          <Box flex="0.5" minW="100px">
            <Text fontSize="sm" mb={1}>Items per page</Text>
            <select
              value={filters.per_page}
              onChange={(e) => setFilters({ per_page: Number(e.target.value), page: 1 })}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
            </select>
          </Box>
          <Button bg="gray.200" size="sm" onClick={handleResetFilters} px={4}>
            Reset
          </Button>
        </Flex>

        {isLoading ? (
          <Flex justify="center" align="center" flex="1">
            <Spinner size="xl" color="rgb(4, 120, 87)" />
          </Flex>
        ) : (
          <>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 0.2fr)" }}
              gap={6}
              justifyContent="center"
              justifyItems="center"
              w="100%"
              p={4}
            >
              {history.map(cardList => (
                <GridItem key={cardList.id}>
                    <OneHistoryCard
                      id={cardList.id}
                      title={cardList.title}
                      onFileUploaded={() => fetchHistory()} 
                    />
                </GridItem>
              ))}
            </Grid>
            {totalItems === 0 && !isLoading && (
              <Text mt={10} color="gray.500">No card lists found</Text>
            )}
            {renderPagination()}
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default History;