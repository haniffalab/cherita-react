const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

// List of files to update
const filesToUpdate = ['CITATION.cff'];

filesToUpdate.forEach((relativePath) => {
  const filePath = path.join(__dirname, relativePath);
  const file = fs.readFileSync(filePath, 'utf8');

  // Replace the version line (like `version: "X.Y.Z"`)
  const newFile = file.replace(/^version: .*/m, `version: "${newVersion}"`);

  fs.writeFileSync(filePath, newFile);
  console.log(`Updated ${relativePath} to version ${newVersion}`);
});
