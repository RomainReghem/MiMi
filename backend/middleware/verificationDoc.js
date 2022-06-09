const fs = require('fs');
const multer = require("multer");
const path = require("path")

const maxSize = 80 * 1024 * 1024;

const storage = multer.memoryStorage();

/**
 * Fonction de filtre pour multer, sert à valider le type du fichier, dans ce cas, un pdf.
 * @param {*} req la requête du client
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
    return cb('Erreur : seuls les pdf sont autorisés !');
  }
}

const upload = multer({ storage: storage, limits: maxSize, fileFilter: fileFilter })

module.exports = upload;