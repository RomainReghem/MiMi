const util = require("util");
const Multer = require("multer");
const path = require("path")
// taille max du fichier, pas plus grand que 80mb (10Mo),
const maxSize = 80 * 1024 * 1024;

/*const processFile = Multer({
  // pour le fichier utilisera la mémoire tampon de Multer
  storage: Multer.memoryStorage(
    { destination: './Eleves/temp/' },
    {
      filename: function (req, file, cb) {
        cb(file.originalname);
      }
    }
  ),
  limits: { fileSize: maxSize }
}).single("file");

let processFileMiddleware = util.promisify(processFile);*/

const storage = Multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./Eleves/temp/");
  },
  filename: function (req, file, cb) {
    cb(file.originalname);
    //cb(null, Date.now() + "-" + file.fieldname + ".pdf");
  },
});

function fileFilter(req, file, cb) {
  console.log("verification de type")
  // Allowed ext
  const filetypes = /pdf/;

  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    console.log("ps le bon type")
    cb('Erreur : seuls les pdf sont autorisés !');
  }
}

const upload = Multer({ storage: storage, limits:maxSize }).single("file");

module.exports = {upload };
