import { useEffect } from "react"
import Notifs from '../components/Notifs';

const Construction = () => {
    useEffect(() => {
        Notifs('', 'Page en construction', 'Warning');
    })

    return (
        <div className="construction">
            <h1>🚧👷</h1>
        </div>
    )
}

export default Construction;