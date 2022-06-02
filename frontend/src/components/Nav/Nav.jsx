import {
    Box, Flex, Text, IconButton, Button, Stack, Heading, Collapse, Icon, Link, Popover, PopoverTrigger, PopoverContent, useColorModeValue, useBreakpointValue, useDisclosure, Center, Badge, Tooltip, Divider, Image,
} from '@chakra-ui/react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import {
    HamburgerIcon,
    CloseIcon,
    ChevronDownIcon,
    ChevronRightIcon,
} from '@chakra-ui/icons';
import { faGear, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import Avatar from 'react-nice-avatar'
import useLogout from "../../hooks/useLogout";
import { ColorModeSwitcher } from './ColorModeSwitcher';
import useAuth from '../../hooks/useAuth';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useGetImage from '../../hooks/useGetImage';
import useGetAvatar from '../../hooks/useGetAvatar';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useUserData from '../../hooks/useUserData';


export default function Nav() {
    const logout = useLogout();
    const navigate = useNavigate();
    const { isOpen, onToggle } = useDisclosure();
    const { auth } = useAuth();
    const { userData } = useUserData();
    const axiosPrivate = useAxiosPrivate();

    // let avatar_base = {
    //     bgColor: "#E0DDFF",
    //     earSize: "small",
    //     eyeBrowStyle: "up",
    //     eyeStyle: "oval",
    //     faceColor: "#AC6651",
    //     glassesStyle: "none",
    //     hairColor: "#000",
    //     hairStyle: "thick",
    //     hatColor: "#000",
    //     hatStyle: "none",
    //     mouthStyle: "laugh",
    //     noseStyle: "round",
    //     shirtColor: "#6BD9E9",
    //     shirtStyle: "polo",
    //     shape: "square"
    // };

    const [imageURL, setImageURL] = useState("");

    const signOut = async () => {
        await logout();
        navigate('/')
    }

    useEffect(() => {
        async function image() {
            let data = userData?.image
            let binary = '';
            let bytes = new Uint8Array(data);
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            setImageURL("data:image/png;base64," + window.btoa(binary))
        }
        image();
    }, [userData?.image])

    return (
        <Box>
            <Flex
                bg={useColorModeValue('white', 'gray.900')}
                color={useColorModeValue('gray.600', 'white')}
                minH={'60px'}
                py={{ base: 1 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={useColorModeValue('gray.200', 'gray.900')}
                align={'center'}>
                <Flex
                    flex={{ base: 1, md: 'auto' }}
                    ml={{ base: -2 }}
                    display={{ base: 'flex', md: 'none' }}>
                    <IconButton
                        onClick={onToggle}
                        icon={
                            isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
                        }
                        variant={'ghost'}
                        aria-label={'Toggle Navigation'}
                    />
                    <ColorModeSwitcher />
                </Flex>
                <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align={'center'}>
                    {auth?.user && auth?.role == "eleve" ?
                        <Box boxSize={'2rem'} mr={2}>{auth?.preference === "avatar" ?
                            (<Avatar style={{ width: '2rem', height: '2rem' }} {...userData?.avatar} />) :
                            (
                                <Image h={'100%'} w={'100%'} objectFit={'cover'} src={imageURL}></Image>
                            )}</Box> : <></>}
                        <Badge
                            textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                            colorScheme='gray'>
                            {auth?.role == "eleve" ? userData?.pseudo : auth?.role == "classe" ? "classe #" + auth?.idclasse : <></>}
                        </Badge>

                    <Flex display={{ base: 'none', md: 'flex' }} ml={5}>
                        <DesktopNav />
                    </Flex>
                </Flex>

                <Stack
                    flex={{ base: 1, md: 0 }}
                    justify={'flex-end'}
                    direction={'row'}
                    spacing={3}>
                    {!auth?.user && <>
                        <Link textDecoration={'none'} as={ReactRouterLink} to="/choice">
                            <Button
                                display={{ base: 'none', md: 'inline-flex' }}
                                variant={'unstyled'}
                                fontSize={'sm'}
                                fontWeight={400}>
                                S'inscrire
                            </Button>
                        </Link>
                        <Link textDecoration={'none'} as={ReactRouterLink} to="/login">
                            <Button
                                fontSize={'sm'}
                                fontWeight={600}
                                colorScheme={'blue'}>
                                Se connecter
                            </Button>
                        </Link></>}
                    {auth?.user && <Link as={ReactRouterLink} to="/settings"><IconButton colorScheme={'teal'} icon={<FontAwesomeIcon icon={faGear} />}></IconButton></Link>}
                    <ColorModeSwitcher display={{base:'none', md:'inline-flex'}} />
                    {auth?.user && <>
                        <Button display={{ base: 'none', md: 'inline-flex' }} onClick={signOut} colorScheme={'red'}>Déconnexion</Button>
                        <IconButton display={{ base: 'inline-flex', md: 'none' }} onClick={signOut} colorScheme={'red'} icon={<FontAwesomeIcon icon={faPowerOff} />}></IconButton></>}
                </Stack>
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <MobileNav />
            </Collapse>
        </Box>
    );
}

const DesktopNav = () => {
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');
    const popoverContentBgColor = useColorModeValue('white', 'gray.800');

    return (
        <Stack direction={'row'} spacing={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Popover trigger={'hover'} placement={'bottom-start'}>
                        <PopoverTrigger>
                            <Link
                                p={2}
                                href={navItem.href ?? '#'}
                                fontSize={'sm'}
                                fontWeight={500}
                                color={linkColor}
                                _hover={{
                                    textDecoration: 'none',
                                    color: linkHoverColor,
                                }}>
                                {navItem.label}
                            </Link>
                        </PopoverTrigger>

                        {navItem.children && (
                            <PopoverContent
                                border={0}
                                boxShadow={'xl'}
                                bg={popoverContentBgColor}
                                p={4}
                                rounded={'xl'}
                                minW={'sm'}>
                                <Stack>
                                    {navItem.children.map((child) => (
                                        <DesktopSubNav key={child.label} {...child} />
                                    ))}
                                </Stack>
                            </PopoverContent>
                        )}
                    </Popover>
                </Box>
            ))}
        </Stack>
    );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
    return (
        <Link
            href={href}
            role={'group'}
            display={'block'}
            p={2}
            rounded={'md'}
            _hover={{ bg: useColorModeValue('pink.50', 'gray.900') }}>
            <Stack direction={'row'} align={'center'}>
                <Box>
                    <Text
                        transition={'all .3s ease'}
                        _groupHover={{ color: 'pink.400' }}
                        fontWeight={500}>
                        {label}
                    </Text>
                    <Text fontSize={'sm'}>{subLabel}</Text>
                </Box>
                <Flex
                    transition={'all .3s ease'}
                    transform={'translateX(-10px)'}
                    opacity={0}
                    _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
                    justify={'flex-end'}
                    align={'center'}
                    flex={1}>
                    <Icon color={'pink.400'} w={5} h={5} as={ChevronRightIcon} />
                </Flex>
            </Stack>
        </Link>
    );
};

const MobileNav = () => {
    return (
        <Stack
            bg={useColorModeValue('white', 'gray.800')}
            p={4}
            display={{ md: 'none' }}>
            {NAV_ITEMS.map((navItem) => (
                <MobileNavItem key={navItem.label} {...navItem} />
            ))}
        </Stack>
    );
};

const MobileNavItem = ({ label, children, href }) => {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Stack spacing={4} onClick={children && onToggle}>
            <Flex
                py={2}
                as={Link}
                href={href ?? '#'}
                justify={'space-between'}
                align={'center'}
                _hover={{
                    textDecoration: 'none',
                }}>
                <Text
                    fontWeight={600}
                    color={useColorModeValue('gray.600', 'gray.200')}>
                    {label}
                </Text>
                {children && (
                    <Icon
                        as={ChevronDownIcon}
                        transition={'all .25s ease-in-out'}
                        transform={isOpen ? 'rotate(180deg)' : ''}
                        w={6}
                        h={6}
                    />
                )}
            </Flex>

            <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
                <Stack
                    mt={2}
                    pl={4}
                    borderLeft={1}
                    borderStyle={'solid'}
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    align={'start'}>
                    {children &&
                        children.map((child) => (
                            <Link key={child.label} py={2} href={child.href}>
                                {child.label}
                            </Link>
                        ))}
                </Stack>
            </Collapse>
        </Stack>
    );
};


const NAV_ITEMS = [
    {
        label: 'Profil',
        href: '/profile',
    },
    {
        label: 'Documents',
        href: '/documents',
    },
    {
        label: 'Visioconférence',
        href: '/video',
    },
    {
        label: 'Jeux',
        href: '/games',
    },
];