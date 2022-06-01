import { Link } from "react-router-dom";
import { Text, Heading, Box, Stack, Center, Image, Wrap, Badge } from "@chakra-ui/react"


const Jeux = () => {
    return (
        <Center flexGrow={1} >
            <Wrap spacing={10} justify={'center'} p={5}>
                <Link to="/tictactoe" style={{ textDecoration: "none" }} >
                    <Box maxW={'xs'} p={2} transition={'transform 200ms'} _hover={{ transform: 'translate(0px, -0.3rem)', transition: 'transform 500ms' }}>
                        <Image src="https://i.pinimg.com/originals/ce/6f/7f/ce6f7ffd885e477efa2110437ab779dd.gif"></Image>
                        <Stack mt={2} direction={'column'} align="flex-start">
                            <Heading fontSize={'2xl'}>Tic Tac Toe</Heading>
                            <Badge colorScheme={'green'}>Facile</Badge>
                        </Stack>
                    </Box>
                </Link>
                <Box maxW={'xs'} p={2} transition={'transform 200ms'} _hover={{ transform: 'translate(0px, -0.3rem)', transition: 'transform 500ms' }}>
                    <Image src="https://cdn.dribbble.com/users/1159713/screenshots/3397424/game-box-gif.gif"></Image>
                    <Stack mt={2} direction={'column'} align="flex-start">
                        <Heading fontSize={'2xl'}>En développement...</Heading>
                        <Badge colorScheme={'orange'}>Moyen</Badge>
                    </Stack>
                </Box>
                <Box maxW={'xs'} p={2} transition={'transform 200ms'} _hover={{ transform: 'translate(0px, -0.3rem)', transition: 'transform 500ms' }}>
                    <Image src="https://cdn.dribbble.com/users/1159713/screenshots/3397424/game-box-gif.gif"></Image>
                    <Stack mt={2} direction={'column'} align="flex-start">
                        <Heading fontSize={'2xl'}>En développement...</Heading>
                        <Badge colorScheme={'red'}>Difficile</Badge>
                    </Stack>
                </Box>
            </Wrap>
        </Center>
    );
}

export default Jeux;
