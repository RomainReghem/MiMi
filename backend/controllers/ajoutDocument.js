const fs = require('fs');
const fastFolderSize = require('fast-folder-size')

/**
 * Sauvegarde sur le serveur le document de l'utilisateur dans le dossier approprié.
 * 
 * @param {*} req la requête du client, contient le fichier à sauvegarder et le mail de l'utilisateur
 * @param {*} res la réponse du serveur
 */
const saveFile = (req, res) => {
    console.log("\n*** Sauvegarde du fichier ***");
    const email = req.body.mail;
    const path = './Documents/' + email

    const file = req.file

    if (file == null) {
        for (r in req.body.formData) {
            console.log("-" + r)
        }
        console.log("Pas de fichier " + file + " maybe " + req.files)
        return res.status(600).send("Erreur : aucun fichier n'a été trouvé")
    }
    if (file.mimetype != "application/pdf") {
        console.log("Pas le bon type de fichier")
        return res.status(400).send("Le fichier n'est pas un pdf.")
    }
    const nom = file.originalname;

    try {
        verificationChemin(path)
    } catch (err) {
        console.log("erreur verifchemin")
        return res.status(520).send(err);
    }
    // Vérification de si un fichier est unique dans son chemin, si ce n'est pas le cas, il lui attribue un nouveau nom
    let name = verifNom(path, nom);
    if (name == "") {
        console.log("erreur verif nom pas double")
        return res.status(520).send("Erreur lors de la vérification du nom du document.")
    }

    verifTaille(path, file.size, 25000000, err => {
        if (err) {
            //console.log("err " + err)
            return res.status(409).send("L'espace de stockage est limité à 250 Mo !")
        }
        // Enregistrement du fichier en local sur le serveur
        fs.writeFile(path + "/" + name, file.buffer, 'utf8', function (err) {
            if (err) {
                console.log("Erreur lors de l'enregistrement du document : " + err);
                return res.status(600).send("Erreur lors de l'enregistrement, réesayez.")
            }
            console.log("Le fichier a bien été sauvegardé");
            return res.status(201).send("Enregistrement effectué");
        });
    })

}


/**
 * Cette fonction permet de vérifier si le chemin donné en paramètre existe déjà, sinon crée les dossiers nécessaires
 * @param {String} pathToVerify le chemin à vérifier
 */
function verificationChemin(pathToVerify) {
    // on divise les dossiers du chemin
    let dossiers = pathToVerify.split('/')
    // on commence = la base
    let path = dossiers[0]
    // on parcourt le reste des dossiers
    for (var i = 1; i < dossiers.length; i++) {
        try {
            // on ajoute les dossiers au chemin
            path += "/" + dossiers[i]
            // si le chemin existe, alors le dossier est déjà présent
            if (!fs.existsSync(path)) {
                // sinon on crée le dossier
                fs.mkdirSync(path);
            }
        } catch (err) {
            console.error("erreur lors de verification chemin " + err);
            throw new Error("Erreur lors de la création de dossier pour le chemin" + path)
            //return res.status(600).send("Erreur lors de la création de dossier pour le chemin" + path)
        }
    }
}


/**
 * Retourne le nom, changé si besoin pour qu'il soit unique lors de sa sauvegarde
 * @param {String} path le chemin où le fichier est sauvegardé
 * @param {String} nom le nom du fichier avant changement
 * @returns le nom unique du fichier
 */
function verifNom(path, nom) {
    // Vérification si un fichier est unique dans son chemin, si ce n'est pas le cas, il lui attribue un nouveau nom
    let name = nom;
    let isNotUnique = true;
    let i = 1;
    const newnom = name.split(".")[0]
    const extension = name.split(".")[1]

    while (isNotUnique) {
        try {
            if (fs.existsSync(path + "/" + name)) {
                // le nouveau nom sera de la forme : nom-x.type, avec x étant le nombre de fichiers ayant le même nom
                name = newnom + "-" + i + "." + extension
                i++;
            } else {
                isNotUnique = false
            }
        } catch (err) {
            console.log("Erreur verification nom " + err);
            return "";
        }
    }
    return name;
}

/**
 * Fonction qui vérifie la taille d'un dossier, si la taille du fichier fait dépasser la taille maximale, renvoie une erreur
 * @param {String} path le chemin du dossier dont on veut vérifier la taille
 * @param {int} sizeFile la taille du fichier que l'on veut ajouter
 * @param {int} max la valeur maximale de l'espace de stockage, à ne pas dépasser
 * @param {*} cb la fonction callback qui renvoie une erreur ou la taille
 */
function verifTaille(path, sizeFile, max, cb) {
    fastFolderSize(path, (err, size) => {
        if (err) {
            console.log("Err controllers/ajoutDocument.js > verifTaille " + err)
            cb(err);
        }
        if (max < size + sizeFile) {
            cb("Erreur taille max dépassée");
        }
    })
}


module.exports = {
    saveFile,
    verificationChemin,
    verifNom
}
