import React, { useState, useEffect } from "react";
import { Box, Text, Spinner, Flex, Image } from "@chakra-ui/react";

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("/weather?city=Moscow");
        if (!response.ok) throw new Error();
        const data = await response.json();
        setWeather(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) return <Spinner size="sm" />;
  if (error) return <Text fontSize="sm">Погода недоступна</Text>;
  if (!weather) return null;

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <Flex alignItems="center" gap={2}>
      <Image src={iconUrl} alt={weather.description} boxSize="40px" />
      <Box>
        <Text fontWeight="bold">{weather.city}</Text>
        <Text fontSize="sm">{weather.temperature}°C, {weather.description}</Text>
      </Box>
    </Flex>
  );
};

export default WeatherWidget;