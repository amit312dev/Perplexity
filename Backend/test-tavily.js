import "dotenv/config";
import { searchInternet } from "./src/services/internet.service.js";

const result = await searchInternet("latest technology news");

console.log(JSON.stringify(result, null, 2));