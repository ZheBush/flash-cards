import React, { useState } from "react";
import { Text, Flex, Box } from "@chakra-ui/react";

interface OneCardProps {
  q: string;
  a: string;
}

const OneCard: React.FC<OneCardProps> = ({ q, a }) => {
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const toggleAnswer = (): void => {
    setShowAnswer(!showAnswer);
  };

  if (!q && !a) {
    return null;
  }

  return (
    <Flex
      minH="200px"
      w="600px"
      bg="white"
      shadow="md"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      outline="1px solid"
      outlineColor="rgb(4, 120, 87)"
      p={6}
      marginTop = {2}
      marginBottom={2}
      borderRadius="lg"
      cursor="pointer"
      onClick={toggleAnswer}
      transition="all 0.2s"
      _hover={{ 
        shadow: "lg", 
        transform: "translateY(-2px)",
        bg: "rgb(250, 250, 250)"
      }}
    >
      <Flex
        w="100%"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Text
          color="rgb(40, 40, 40)"
          fontSize={18}
          fontWeight="500"
          textAlign="center"
          mb={4}
        >
          {q}
        </Text>

        <Box
          textAlign="center"
          pt={showAnswer ? 4 : 0}
          borderTop={showAnswer ? "1px solid" : "none"}
          borderColor="rgb(220, 220, 220)"
          w="100%"
        >
          {showAnswer ? (
            <Text
              color="rgb(4, 120, 87)"
              fontSize={16}
              fontWeight="400"
              whiteSpace="pre-wrap"
            >
              {a}
            </Text>
          ) : (
            <Text
              color="rgb(160, 160, 160)"
              fontSize={14}
              fontStyle="italic"
            >
              Click to show answer
            </Text>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default OneCard;