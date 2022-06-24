import { Stack, Box, Heading, Text, Center } from '@chakra-ui/react';
import { Link } from 'react-router-dom';


const Choix = () => {
    return (
        <Center flexGrow={1} p={5}>
            <Stack spacing={8} direction='column' maxW={'lg'}>
                <Heading fontSize={'2xl'}>Choix du type de compte :</Heading>
                <Link textDecoration={'none'} to="/register-student">
                    <Box p={5} shadow='md' borderWidth='1px' cursor={'pointer'} transition={'transform 500ms'} _hover={{ transform: 'translate(0px, -0.3rem)', transition: 'transform 500ms' }}>
                        <Heading fontSize='xl'>Je suis l'élève à distance</Heading>
                        <Text mt={4}>Choisissez cette option si vous créez un compte pour l'élève à distance.</Text>
                    </Box>
                </Link>
                <Link textDecoration={'none'} to="/register-class">
                    <Box p={5} shadow='md' borderWidth='1px' cursor={'pointer'} transition={'transform 500ms'} _hover={{ transform: 'translate(0px, -0.3rem)', transition: 'transform 500ms' }}>
                        <Heading fontSize='xl'>J'inscris un compte de classe</Heading>
                        <Text mt={4}>Choisissez cette option si vous créez un compte pour le dispositif qui sera en classe.</Text>
                    </Box>
                </Link>
            </Stack>
        </Center>
    )
}

export default Choix;