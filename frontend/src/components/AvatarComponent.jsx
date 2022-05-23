import Avatar, { genConfig } from 'react-nice-avatar'
import Notifs from '../components/Notifs';
import { useState, useEffect } from 'react'
import axios from '../api/axios';
import randomColor from "randomcolor";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { AiOutlineBgColors } from 'react-icons/ai';
import { RiSave3Fill } from 'react-icons/ri';
import { FaTshirt } from 'react-icons/fa';
import { FaHatCowboy } from 'react-icons/fa';
import { FaGlasses } from 'react-icons/fa';
import { GiNoseSide } from 'react-icons/gi';
import { GiLips } from 'react-icons/gi';
import { GiAngryEyes } from 'react-icons/gi';
import { BiFace } from 'react-icons/bi';


const AvatarComponent = () => {

    const { auth } = useAuth();
    const { setAuth } = useAuth();
    const axiosPrivate = useAxiosPrivate();


    let mail = auth?.user;

    useEffect(() => {
        getAvatar()        
    },[])

    const getAvatar = async (e) => {
        try {
            const response = await axiosPrivate.get("/avatar",{params: { mail: auth?.user }});
            setConfig(JSON.parse(response.data.avatar));
        } catch (err) { console.log("Erreur du chargement de l'avatar"); }
    }
    
    const [config, setConfig] = useState(JSON.parse(localStorage.getItem("avatar")));

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
        localStorage.setItem("avatar", JSON.stringify(config))
        setAuth({
            ...auth,
            somethingchanged: (0 + Math.random() * (10000 - 0))      
        });

        
    }

    const SaveDB = async (e) => {
        try {
            const response = await axiosPrivate.post("/avatar", JSON.stringify({ mail, avatar:config }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });
            
            Notifs("Avatar sauvegardé !", "Rechargez la page s'il ne s'affiche pas correctement", "Success")
            

        } catch (err) { console.log("couldnt save avatar"); }
    }

    const iconSize = 28;


    return (
        <>
            <section className="profileGraphics">
                
                <div className="profileAvatar">
                    <Avatar 
                        {...config}
                        style={{ width: '15rem', height: '15rem', minWidth: '250px', minHeight: '250px',marginBottom: "20px" }}
                    />
                    <div className="controls">
                        <div className="controls-firstRow">
                            <button className="controls-btn" onClick={changeBg}><AiOutlineBgColors size={iconSize} /></button>
                            <button className="controls-btn" onClick={() => setConfig({ ...config, glassesStyle: glasses[(glasses.findIndex((e) => e === config.glassesStyle) + 1) % glasses.length] })}><FaGlasses size={iconSize} /></button>
                            <button className="controls-btn" onClick={() => setConfig({ ...config, shirtStyle: shirts[(shirts.findIndex((e) => e === config.shirtStyle) + 1) % shirts.length], shirtColor: randomColor() })}><FaTshirt size={iconSize} /></button>
                            <button className="controls-btn" onClick={changeHat}><FaHatCowboy size={iconSize} /></button>
                        </div>

                        <div className="controls-secondRow">
                            <button className="controls-btn" onClick={() => setConfig({ ...config, faceColor: faces[(faces.findIndex((e) => e === config.faceColor) + 1) % faces.length] })}><BiFace size={iconSize} /></button>
                            <button className="controls-btn" onClick={() => setConfig({ ...config, mouthStyle: mouths[(mouths.findIndex((e) => e === config.mouthStyle) + 1) % mouths.length] })}><GiLips size={iconSize} /></button>
                            <button className="controls-btn" onClick={() => setConfig({ ...config, eyeStyle: eyes[(eyes.findIndex((e) => e === config.eyeStyle) + 1) % eyes.length] })}><GiAngryEyes size={iconSize} /></button>
                            <button className="controls-btn" onClick={() => setConfig({ ...config, noseStyle: noses[(noses.findIndex((e) => e === config.noseStyle) + 1) % noses.length] })}><GiNoseSide size={iconSize} /></button>

                        </div>
                        <div className="controls-thirdRow">
                            <button className="controls-btn" onClick={RandomC}><GiPerspectiveDiceSixFacesRandom size={iconSize} /> Aléatoire</button>
                            <button className="controls-btn" onClick={() => { Save(); SaveDB();}}><RiSave3Fill size={iconSize} /> Sauvegarder</button>
                        </div>
                    </div>
                </div>
            </section>

        </>
    )
}

export default AvatarComponent;