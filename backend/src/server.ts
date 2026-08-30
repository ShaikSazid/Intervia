import "dotenv/config";

import app from "./app.js";

const port = Number(process.env.PORT) || 8080;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});