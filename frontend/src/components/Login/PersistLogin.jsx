import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from "../../hooks/useRefreshToken";
import useAuth from "../../hooks/useAuth";
import { CircularProgress, Progress, Stack, Center,useColorModeValue, Text, Flex } from "@chakra-ui/react"
import * as React from "react";
import { motion } from 'framer-motion'

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();
    
    const icon = {
        hidden: {
            opacity: 0,
            pathLength: 0,
            fill: useColorModeValue("rgba(49, 130, 206, 0)","rgba(144, 205, 244, 0)")
        },
        visible: {
            opacity: 1,
            pathLength: 1,
            fill: useColorModeValue("rgba(49, 130, 206, 1)","rgba(144, 205, 244, 1)")
        }
    };

    const itemClass = useColorModeValue('itemLight', 'itemDark');
    useEffect(() => {
        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                setIsLoading(false);
            }
        }

        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

    }, [])
    

    return (
        <>
            {isLoading
                ?<Flex direction={'column'} minH={'100%'}> <Center flexGrow={1}>    
                <Stack>        
                <motion.svg xmlns="http://www.w3.org/2000/svg" className={itemClass} width="117" height="41" viewBox="0 0 117 41">
                        <motion.path
                            d="M 29.7 4.95 L 39.75 4.95 L 39.75 40.05 L 31.2 40.05 L 31.2 19 L 23.35 40.05 L 16.45 40.05 L 8.55 18.95 L 8.55 40.05 L 0 40.05 L 0 4.95 L 10.1 4.95 L 19.95 29.25 L 29.7 4.95 Z M 90.35 4.95 L 100.4 4.95 L 100.4 40.05 L 91.85 40.05 L 91.85 19 L 84 40.05 L 77.1 40.05 L 69.2 18.95 L 69.2 40.05 L 60.65 40.05 L 60.65 4.95 L 70.75 4.95 L 80.6 29.25 L 90.35 4.95 Z M 45.9 12.15 L 54.45 12.15 L 54.45 40.05 L 45.9 40.05 L 45.9 12.15 Z M 106.55 12.15 L 115.1 12.15 L 115.1 40.05 L 106.55 40.05 L 106.55 12.15 Z M 48.512 9.033 A 6.236 6.236 0 0 0 50.2 9.25 A 6.642 6.642 0 0 0 51 9.203 A 4.901 4.901 0 0 0 53.825 7.925 A 5.188 5.188 0 0 0 53.955 7.8 A 4.279 4.279 0 0 0 55.25 4.65 A 5.484 5.484 0 0 0 55.247 4.464 A 4.325 4.325 0 0 0 53.825 1.325 Q 52.4 0 50.2 0 A 6.751 6.751 0 0 0 49.183 0.074 A 4.883 4.883 0 0 0 46.525 1.325 Q 45.1 2.65 45.1 4.65 A 5.22 5.22 0 0 0 45.103 4.832 A 4.277 4.277 0 0 0 46.525 7.925 A 4.76 4.76 0 0 0 48.512 9.033 Z M 109.162 9.033 A 6.236 6.236 0 0 0 110.85 9.25 A 6.642 6.642 0 0 0 111.65 9.203 A 4.901 4.901 0 0 0 114.475 7.925 A 5.188 5.188 0 0 0 114.605 7.8 A 4.279 4.279 0 0 0 115.9 4.65 A 5.484 5.484 0 0 0 115.897 4.464 A 4.325 4.325 0 0 0 114.475 1.325 Q 113.05 0 110.85 0 A 6.751 6.751 0 0 0 109.833 0.074 A 4.883 4.883 0 0 0 107.175 1.325 Q 105.75 2.65 105.75 4.65 A 5.22 5.22 0 0 0 105.753 4.832 A 4.277 4.277 0 0 0 107.175 7.925 A 4.76 4.76 0 0 0 109.162 9.033 Z"
                            variants={icon}
                            initial="hidden"
                            animate="visible"
                            transition={{
                                default: { duration: 2, ease: "easeInOut" },
                                fill:{duration:2 }
                            }}
                        />
                    </motion.svg>
                    <Progress colorScheme={'blue'} size='xs' isIndeterminate />
                    <Text align={'center'} fontSize={'xs'} >Chargement</Text></Stack>
                </Center></Flex>
                : <Outlet />}

        </>
    )
}

export default PersistLogin;