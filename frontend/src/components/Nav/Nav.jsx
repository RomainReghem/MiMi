import {
    Box, Flex, Text, IconButton, Button, Stack, PopoverBody, Collapse, Icon, Link, Popover, PopoverTrigger, PopoverContent, useColorModeValue, useBreakpointValue, useDisclosure, Center, Badge, Tooltip, Divider, Image,
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
    const [imageURL, setImageURL] = useState("");
    const { onOpen, onClose } = useDisclosure()

    const signOut = async () => {
        await logout();
        navigate('/')
    }

    useEffect(() => {
        async function image() {
            let blob = new Blob([new Uint8Array(userData?.image)], { type: 'image/jpg' });
            let url = URL.createObjectURL(blob)
            setImageURL(url)
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
                                fontWeight={400}
                                _focus={{ outline: 'none' }}>
                                S'inscrire
                            </Button>
                        </Link>

                        <Button
                            onClick={() => { navigate('/login') }}
                            fontSize={'sm'}
                            fontWeight={600}
                            colorScheme={'blue'}
                        >
                            Se connecter
                        </Button>
                    </>}
                    <ColorModeSwitcher display={{ base: 'none', md: 'inline-flex' }} />
                    {auth?.user && <Link as={ReactRouterLink} to="/settings"><IconButton colorScheme={'teal'} icon={<FontAwesomeIcon icon={faGear} />}></IconButton></Link>}
                    {auth?.user && <>
                        <Popover placement="bottom">
                            <PopoverTrigger>
                                <Button display={{ base: 'none', md: 'inline-flex' }} colorScheme={'red'}>Déconnexion</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverBody>
                                    <Stack>
                                        <Text>Voulez vous vraiment vous déconnecter ?</Text>
                                        <Button colorScheme={'red'} onClick={signOut}>Déconnexion</Button>
                                    </Stack>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>

                        <Popover placement="bottom">
                            <PopoverTrigger>
                                <IconButton display={{ base: 'inline-flex', md: 'none' }} colorScheme={'red'} icon={<FontAwesomeIcon icon={faPowerOff} />}></IconButton>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverBody>
                                    <Stack>
                                        <Text>Voulez vous vraiment vous déconnecter ?</Text>
                                        <Button colorScheme={'red'} onClick={signOut}>Déconnexion</Button>
                                    </Stack>
                                </PopoverBody>
                            </PopoverContent>
                        </Popover>

                    </>}
                </Stack>
            </Flex>

            <Collapse in={isOpen} animateOpacity onClick={onToggle}>
                <MobileNav />
            </Collapse>
        </Box>
    );
}

const DesktopNav = () => {
    const linkColor = useColorModeValue('gray.600', 'gray.200');
    const linkHoverColor = useColorModeValue('gray.800', 'white');
    const popoverContentBgColor = useColorModeValue('white', 'gray.800');
    const { auth } = useAuth();

    const NAV_ITEMS = auth?.user ? [
        { label: 'Profil', href: '/profile', },
        { label: 'Documents', href: '/documents', },
        { label: 'Visioconférence', href: '/video', },
        { label: 'Jeux', href: '/games', },
    ] : [{ label: 'Accueil', href: '/' }, { label: 'Tableau de bord', href: '/profile', }, { label: 'Termes et conditions', href: '/terms', }];

    return (
        <Stack direction={'row'} spacing={4}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Popover trigger={'hover'} placement={'bottom-start'}>
                        <PopoverTrigger>
                            <Link
                                as={ReactRouterLink}
                                p={2}
                                to={navItem.href ?? '#'}
                                fontSize={'sm'}
                                fontFamily={'heading'}
                                fontWeight={600}
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
            as={ReactRouterLink}
            to={href}
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
                        fontFamily={'heading'}
                        fontWeight={600}>
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
    const { auth } = useAuth();

    const NAV_ITEMS = auth?.user ? [
        { label: 'Profil', href: '/profile', },
        { label: 'Documents', href: '/documents', },
        { label: 'Visioconférence', href: '/video', },
        { label: 'Jeux', href: '/games', },
    ] : [{ label: 'Accueil', href: '/' }, { label: 'Tableau de bord', href: '/profile', }, { label: 'Termes et conditions', href: '/terms', }];

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
                as={ReactRouterLink}
                to={href ?? '#'}
                justify={'space-between'}
                align={'center'}
                _hover={{
                    textDecoration: 'none',
                }}>
                <Text
                    fontFamily={'heading'}
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
                            <Link key={child.label} py={2} to={child.href} as={ReactRouterLink}>
                                {child.label}
                            </Link>
                        ))}
                </Stack>
            </Collapse>
        </Stack>
    );
};