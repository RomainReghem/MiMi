const util = require("util");
const Multer = require("multer");
// taille max du fichier, pas plus grand que 80mb (10Mo),
const maxSize = 80 * 1024 * 1024;

let processFile = Multer({
    // pour le fichier utilisera la mémoire tampon de Multer
  storage: Multer.memoryStorage(),
  limits: { fileSize: maxSize }
}).single("files");

let processFileMiddleware = util.promisify(processFile);

module.exports = processFileMiddleware;
