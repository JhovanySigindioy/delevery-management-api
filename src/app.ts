import appExpress from "./config/server";

appExpress.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000");
});