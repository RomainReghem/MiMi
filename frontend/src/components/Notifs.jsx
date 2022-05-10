// Composant qui ne sert qu'a envoyer les notifs.


import { Store } from 'react-notifications-component';

function useNotif(titre, msg, t){
    Store.addNotification({
        title: titre,
        message: msg,
        type: t,
        insert: "bottom",
        container: "bottom-left",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dismiss: {
            duration: 5000,
            onScreen: true
        },
    });
}
export default useNotif;