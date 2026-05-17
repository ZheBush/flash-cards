import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Flex, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const canonicalUrl = `${window.location.origin}/`;

  return (
    <>
      <Helmet>
        <title>Генератор карточек</title>
        <link rel="canonical" href={canonicalUrl} />
        <meta 
          name="description" 
          content="Сервис для создания учебных карточек из текста, TXT или PDF. Генерируй карточки быстро и бесплатно."
        />
        <meta 
          property="og:title" 
          content="Генератор карточек – учись с удовольствием"
        />
        <meta 
          property="og:description" 
          content="Создавайте карточки для запоминания из текста, TXT или PDF. Бесплатно, без регистрации (гостевой режим)."
        />
        <meta 
          property="og:image" 
          content="https://fleshcards.com/og-home.png"
        />
        <meta 
          property="og:url" 
          content="https://fleshcards.com/"
        />
        <meta 
          name="twitter:card" 
          content="summary_large_image"
        />
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

      <Flex minH="100vh" align="center" justify="center" direction="column" bg="rgb(240,240,240)">
        <VStack scaleY={6}>
          <Text fontSize="3rem" fontWeight="bold" color="rgb(40,40,40)">Генератор карточек</Text>
          <Text fontSize="xl" textAlign="center" maxW="600px">
            Создавайте карточки для запоминания из текста, TXT или PDF.<br />
            Быстро, бесплатно, без регистрации.
          </Text>
          <Button
            size="lg"
            bg="rgb(4,120,87)"
            color="white"
            _hover={{ bg: "rgb(24,140,107)" }}
            onClick={() => navigate('/home')}
          >
            Попробовать
          </Button>
        </VStack>
      </Flex>
    </>
  );
};

export default Landing;