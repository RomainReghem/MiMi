const multer = require("multer");
const path = require("path")

const maxSize = 80 * 1024 * 1024;

const storage = multer.memoryStorage();

/**
 * Fonction de filtre pour multer, sert à valider le type du fichier, dans ce cas, une image.
 * @param {*} req 
 * @param {*} file le fichier donné par multer
 * @param {*} cb la fonction callback
 * @returns 
 */
function fileFilter(req, file, cb) {
  //console.log("** Verification de type d'image **")
  // Les extensions/types de fichiers autorisés
  const filetypes = /png|jpg|jpeg|jfif|gif/;
  // On recupere l'extension (par exemple .txt)
  const ext = path.extname(file.originalname).toLowerCase();
  // On vérifie que l'extension corresponde bien aux extensions données
  const extname = filetypes.test(ext);
  // On récupère le type mime du fichier et s'il correspond bien à un type de fichier autorisé, alors la variable prend la valeur true
  const mimetype = filetypes.test(file.mimetype);
  // si les deux sont vrais, alors l'image est du bon type
  if (mimetype && extname) {
    //console.log("bon type")
    req.fileextname = ext;
    return cb(null, true);
  } else {
    console.log("Err middleware/verificationImage.js > fileFilter : ps le bon type mimetype %s et extname %s", file.mimetype, ext)
    return cb(new Error('Erreur : seuls les images png, jpg, jpeg, jfif et gif sont autorisées !'));
  }
}


function avatarAsImageFilter(req, file, cb) {
  //console.log("** Verification de type d'image **")
  // Les extensions/types de fichiers autorisés
  const filetypes = /png/;
  const ext = path.extname(file.originalname).toLowerCase();
  // On vérifie que l'extension corresponde bien à png
  const extname = filetypes.test(ext);
  if (extname) {
    //console.log("bon type")
    //req.fileextname=ext;
    return cb(null, true);
  } else {
    console.log("Err middleware/verificationImage.js > avatarAsImageFilter : ps le bon type extname %s", ext)
    return cb('Erreur : seuls les images png sont autorisées !');
  }
}

const upload = multer({ storage: storage, limits: maxSize, fileFilter: fileFilter })
const uploadAvatar = multer({ storage: storage, limits: maxSize, fileFilter: avatarAsImageFilter })

module.exports = {
  upload,
  uploadAvatar
};