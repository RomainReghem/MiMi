const fs = require('fs');
const multer = require("multer");
const path = require("path")

const maxSize = 80 * 1024 * 1024;

const storage = multer.memoryStorage();
/*multer.diskStorage({
  // pour la destination de sauvegarde du fichier
  destination: (req, file, cb) => {
    // avant de mettre le fichier dans la destination temporaire, on vérifie que les dossiers existent
    // sinon, on les crée
    try {
      if (!fs.existsSync('./Eleves')) {
        fs.mkdirSync('./Eleves');
      }
    } catch (err) {
      console.error(err);
      return res.status(600).send("Erreur lors de la création de dossier pour les eleves ")
    }
    try {
      if (!fs.existsSync('./Eleves/temp')) {
        fs.mkdirSync('./Eleves/temp');
      }
    } catch (err) {
      console.error(err);
      return res.status(600).send("Erreur lors de la création de dossier pour les fichiers temporaires ")
    }
    cb(null, './Eleves/temp')
  },
  // pour le nom du fichier (on ne le changera pas)
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})*/

/**
 * Fonction de filtre pour multer, sert à valider le type du fichier, dans ce cas, un pdf.
 * @param {*} req 
 * @param {*} file le fichier donné par multer
 * @param {*} cb la fonction callback
 * @returns 
 */
function fileFilter(req, file, cb) {
  console.log("** Verification de type de document **")
  // Allowed ext
  const filetypes = /pdf/;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    console.log("bon type (pdf)")
    return cb(null, true);
  } else {
    console.log("ps le bon type")
    cb('Erreur : seuls les pdf sont autorisés !');
  }
}

const upload = multer({ storage: storage, limits: maxSize, fileFilter: fileFilter })

module.exports = upload;