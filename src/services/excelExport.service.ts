// src/services/excelExport.service.ts
import ExcelJS from "exceljs";
import { ManagementEntregaResponse } from "../interfaces";

export async function generateEntregasExcel(data: ManagementEntregaResponse[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Entregas");

  worksheet.columns = [
    { header: "ID Gestión", key: "managementId", width: 15 },
    { header: "Paciente", key: "patientName", width: 30 },
    { header: "Identificación", key: "identification", width: 20 },
    { header: "Teléfono 1", key: "primaryPhone", width: 15 },
    { header: "Teléfono 2", key: "secondaryPhone", width: 15 },
    { header: "Correo", key: "email", width: 25 },
    { header: "Dirección", key: "address", width: 40 },
    { header: "Fecha Gestión", key: "managementDate", width: 15 },
    { header: "Hora Gestión", key: "managementTime", width: 12 },
    { header: "Fecha Entrega", key: "deliveryDate", width: 15 },
    { header: "Hora Entrega", key: "deliveryTime", width: 12 },
    { header: "Tipo Empaque", key: "packageType", width: 15 },
    { header: "Resultado Llamada", key: "callResult", width: 20 },
    { header: "Notas", key: "notes", width: 40 },
    { header: "Urgente", key: "isUrgent", width: 10 },
    { header: "Domicilio", key: "sentToHome", width: 10 },
  ];

  data.forEach((row) => {
    worksheet.addRow({
      ...row,
      isUrgent: row.isUrgent ? "Sí" : "No",
      sentToHome: row.sentToHome ? "Sí" : "No",
    });
  });

  worksheet.getRow(1).font = { bold: true };

  return workbook.xlsx.writeBuffer();
}
