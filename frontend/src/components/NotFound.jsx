import { Button, Center, Heading, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
    // Page d'erreur 404.
    const navigate = useNavigate();
    return (
        <Center height={'100%'}>
            <Stack spacing={3}>

            <Heading fontSize={'xl'}>Cette page n'existe pas</Heading>
            <Button colorScheme={'blue'} onClick={() => navigate('/profile')}>Revenir à l'application</Button>
            </Stack>
        </Center>
    )
}

export default NotFound;