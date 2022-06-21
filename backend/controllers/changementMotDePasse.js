const nodemailer = require('nodemailer');
const { determiningRole } = require('../middleware/verificationAccesDoc');
//var generator = require('generate-password')


/*const resetPassword=(req, res)=>{
    const email=req.body.email;
    // on va génèrer un mot de passe temporaire
    const pwd=generator.generate({
        length:24,
        numbers:true,
        symbols:"!@#$%",
        lowercase:true,
        uppercase:true,
        strict:true
    })
    // on doit lui envoyer par email
    // on le stocke dans une base de données des mdp tempo avec l'adresse mail associé
    // va sur la page de changement de mdp 
    // entre le mdp tempo et son email 
    // arrive sur une page pour changer son mdp
}*/


const resetPassword = (req, res) => {
    const email = req.body.mail;
    determiningRole(email, function (err, role) {
        if (err) {
            console.log(err)
            return res.status(404).send("Cet utilisateur n'existe pas.")
        }
        else if (role == "eleve") {
            // generer token
            //sendEmail(email)
        } else {
            // c'est une classe 
        }
        //sendEmail(email, "1234");
        // si l'email appartient bien à un élève/classe on envoie un mail avec un lien contenant un token pour la reinitialisatuion du mdp
        // dans une autre fonction : verif si tokrn valide pour chnager mdp 
    })
}


function sendEmail(email, token) {
    var email = email;
    var token = token;

    var mail = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASSWORD,
        }
    });
    var mailOptions = {
        from: "MIMI",
        to: email,
        subject: "Demande de changement de mot de passe : mimi.connected-health.fr",
        html: `<p>Bonjour, vous avez fait une demande de changement de mot de passe pour votre compte Mimi. </br>
        Pour changer votre mot de passe, <a href="http://localhost:3500/reset-password?token=${token}">appuyez ici</a> ou copiez le lien http://localhost:4000/reset-password?token=${token} dans votre navigateur. (Ce lien est valide seulement pendant 24 heures.) </p>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez nous contacter à l'adresse suivante : mimi@connected-health.fr</p>`
    }
    mail.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Err controllers/eleve.js > sendEmail : erreur lors de l'envoi du mail " + error)
        } else {
            console.log("mail envoyé ")
        }
    });
}