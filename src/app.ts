import appExpress from "./config/server";

appExpress.listen(3000, () => {
    console.log("Server started on port 3000");
});