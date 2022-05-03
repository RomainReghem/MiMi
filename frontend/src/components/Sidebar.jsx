import {CgProfile} from 'react-icons/cg';
import {IoMdDocument} from 'react-icons/io';
import {MdOutlineVideoCameraFront} from 'react-icons/md';
import {FaGamepad} from "react-icons/fa";
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const iconSize = 28;
    return (
        <div className="sidebarContainer">
            <Link to="/dashboard/profile"><div><p><CgProfile size={iconSize} className="sidebarIcons"/></p></div></Link>
            <Link to="/dashboard/documents"><div><p><IoMdDocument size={iconSize} className="sidebarIcons"/></p></div></Link>
            <Link to="/dashboard/"><div><p><MdOutlineVideoCameraFront size={iconSize} className="sidebarIcons"/></p></div></Link>
            <Link to="/dashboard/"><div><p><FaGamepad size={iconSize} className="sidebarIcons"/></p></div></Link>
        </div>
    );
}

export default Sidebar;