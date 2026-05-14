const fs = require("fs");
const path = require("path");

const replacements = {
  "bg-green-50": "bg-success-bg",
  "text-green-600": "text-success",
  "text-green-500": "text-success",
  "border-green-100": "border-success-border",
  "border-green-200": "border-success-border",
  "bg-green-500/20": "bg-success-bg",
  "text-green-400": "text-success",
  "bg-green-500": "bg-success",
  
  "bg-orange-50": "bg-warning-bg",
  "text-orange-500": "text-warning",
  "border-orange-100": "border-warning-border",
  "bg-orange-500": "bg-warning",
  "bg-orange-50/50": "bg-warning-bg",
  
  "bg-red-50": "bg-destructive-bg",
  "text-red-600": "text-destructive",
  "text-red-500": "text-destructive",
  "border-red-100": "border-destructive-border",
  "border-red-200": "border-destructive-border",
  "bg-red-600": "bg-destructive",
  "bg-red-500": "bg-destructive",
  "hover:text-red-500": "hover:text-destructive",
  "hover:bg-red-50": "hover:bg-destructive-bg",
  "hover:border-red-100": "hover:border-destructive-border",
  "hover:text-red-600": "hover:text-destructive",
  
  "bg-blue-50": "bg-info-bg",
  "text-blue-600": "text-info",
  "border-blue-100": "border-info-border",
  "hover:text-blue-600": "hover:text-info",
  "text-yellow-500": "text-warning",
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf8");
      let changed = false;
      
      for (const [key, value] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.split(key).join(value);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir("./app");
processDir("./components");
