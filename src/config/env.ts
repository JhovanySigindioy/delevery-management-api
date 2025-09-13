import dotenv from 'dotenv';
import { getNameServerPos01 } from '../globalConfig/getNameServer';

dotenv.config();

const hostNamePos01 = getNameServerPos01();

export const env = {
    dbData: {
        db_dialect: process.env.DB_DIALECT || "mssql",
        db_host: hostNamePos01 || "",
        db_user: process.env.DB_USER || "",
        db_password: process.env.DB_PASSWORD || "",
        db_name: process.env.DB_NAME || "",
        db_port: parseInt(process.env.DB_PORT || "1433"),
    },
    jwtData: {
        jwt_secret: process.env.JWT_SECRET || "",
    },
    apiPonal: {
        url: process.env.URL_API_V1_PONAL || "",
        servicio: process.env.SERVICIO_API_V1_PONAL || "",
    },
    apiDeliveryCompany: {
        urlShippings: process.env.URL_BASE_API_DELIVERY_COMPANY || "",
    },
    authApi: {
        url: process.env.API_LOGIN_ETICOS || "",
    }
};
