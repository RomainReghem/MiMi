import Avatar, { genConfig } from 'react-nice-avatar'
import { Heading, useToast } from '@chakra-ui/react';
import { useState, useEffect } from 'react'
import randomColor from "randomcolor";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { AiOutlineBgColors } from 'react-icons/ai';
import { FaTshirt, FaGlasses, FaHatCowboy } from 'react-icons/fa';
import { GiNoseSide, GiLips} from 'react-icons/gi';
import { BiFace } from 'react-icons/bi';
import { Stack, Text, IconButton, Button, Tooltip } from "@chakra-ui/react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import useUserData from '../../hooks/useUserData';


const AvatarComponent = () => {
    const toast = useToast();
    const { auth, setAuth } = useAuth();
    const { userData, setUserData } = useUserData();
    const axiosPrivate = useAxiosPrivate();
    
    const [config, setConfig] = useState(userData?.avatar);

    let mail = auth?.user;

    const shirts = ["hoody", "short", "polo"]
    const glasses = ["none", "round", "square"]
    const noses = ["short", "long", "round"]
    const mouths = ["laugh", "smile", "peace"]
    const eyes = ["circle", "oval", "smile"]
    const hatsnhairs = [["none", "normal"], ["none", "thick"], ["none", "mohawk"], ["none", "womanLong"], ["none", "womanShort"], ["beanie", "normal"], ["turban", "normal"]]
    const faces = ["#c58c85", "#f9c9b6", "#ac6651", "#592f2a"]

    const changeBg = (e) => {
        e.preventDefault();
        setConfig({
            ...config,
            bgColor: randomColor()
        });
    }

    const RandomC = (e) => {
        e.preventDefault();
        setConfig({
            ...genConfig(),
            shape: "square"
        });

    }

    const changeHat = (e) => {
        e.preventDefault();
        let i = hatsnhairs.findIndex((e) => e[0] == config.hatStyle && e[1] == config.hairStyle)
        setConfig({
            ...config,
            hatStyle: hatsnhairs[(i + 1) % hatsnhairs.length][0],
            hairStyle: hatsnhairs[(i + 1) % hatsnhairs.length][1],
            hatColor: randomColor(),
            hairColor: randomColor()

        });
    }

    const Save = () => {
        setUserData({
            ...userData,
            avatar:config
        })
    }

    const SaveDB = async (e) => {
        try {
            const response = await axiosPrivate.post("/avatar", JSON.stringify({ mail, avatar: config }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            toast({ title: "Avatar sauvegardé !", description: "", status: "success", duration: 5000, isClosable: true, position: "top" })
        } catch (err) { console.log("couldnt save avatar"); }
    }

    return (
        <>
            <Stack spacing={2}>
                <Heading fontSize={'2xl'} >Créateur d'avatar</Heading>
                <Avatar
                    {...config}
                    style={{ width: '15rem', height: '15rem', minWidth: '250px', minHeight: '250px'}}
                />
                <Stack spacing={3} direction={'row'} w={'100%'} justify='center'>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={changeBg} icon={<AiOutlineBgColors/>}></IconButton>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={() => setConfig({ ...config, glassesStyle: glasses[(glasses.findIndex((e) => e === config.glassesStyle) + 1) % glasses.length] })} icon={<FaGlasses/>}></IconButton>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={() => setConfig({ ...config, shirtStyle: shirts[(shirts.findIndex((e) => e === config.shirtStyle) + 1) % shirts.length], shirtColor: randomColor() })} icon={<FaTshirt/>}></IconButton>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={changeHat} icon={<FaHatCowboy/>}></IconButton>
                </Stack>

                <Stack spacing={3} direction={'row'} w={'100%'} justify='center'>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={() => setConfig({ ...config, faceColor: faces[(faces.findIndex((e) => e === config.faceColor) + 1) % faces.length] })} icon={<BiFace/>}></IconButton>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={() => setConfig({ ...config, mouthStyle: mouths[(mouths.findIndex((e) => e === config.mouthStyle) + 1) % mouths.length] })} icon={<GiLips/>}></IconButton>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={() => setConfig({ ...config, eyeStyle: eyes[(eyes.findIndex((e) => e === config.eyeStyle) + 1) % eyes.length] })} icon={<FontAwesomeIcon icon={faEye}/>}></IconButton>
                    <IconButton colorScheme={'blue'} size={'lg'} onClick={() => setConfig({ ...config, noseStyle: noses[(noses.findIndex((e) => e === config.noseStyle) + 1) % noses.length] })} icon={<GiNoseSide/>}></IconButton>

                </Stack>
                <Stack direction={'row'} justify='center'>
                    <Tooltip label='Générer un avatar aléatoire' fontSize='md' placement="bottom">
                    <Button variant={'outline'} colorScheme={'blue'} onClick={RandomC}>Aléatoire</Button>
                    </Tooltip>
                    <Tooltip label="Sauvegarder l'avatar" fontSize='md' placement="bottom">
                    <Button variant={'outline'} colorScheme={'green'} onClick={() => { Save(); SaveDB(); }}>Sauvegarder</Button>
                    </Tooltip>
                </Stack>

            </Stack>
        </>
    )
}

export default AvatarComponent;