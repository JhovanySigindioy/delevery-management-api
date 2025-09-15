// src/services/excelExport.service.ts
import ExcelJS from "exceljs";
import { ManagementEntregaResponse } from "../interfaces";

export async function generateEntregasExcel(data: ManagementEntregaResponse[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Entregas");

  worksheet.columns = [
    { header: "ID Gestión", key: "managementId", width: 15 },
    { header: "Municipio", key: "municipalityName", width: 20 },
    { header: "Departamento", key: "departmentName", width: 20 },
    { header: "Urgente", key: "isUrgent", width: 10 },
    { header: "Paciente (Recibe)", key: "patientName", width: 30 },
    { header: "Teléfono 1", key: "primaryPhone", width: 15 },
    { header: "Teléfono 2", key: "secondaryPhone", width: 15 },
    { header: "Correo", key: "email", width: 25 },
    { header: "Dirección", key: "address", width: 40 },

    { header: "Fecha Entrega", key: "deliveryDate", width: 15 },
    { header: "Hora Entrega", key: "deliveryTime", width: 12 },
    { header: "Tipo Empaque", key: "packageType", width: 15 },
    { header: "Notas", key: "notes", width: 40 },

  ];

  // Agregar filas
  data.forEach((row) => {
    worksheet.addRow({
      ...row,
      isUrgent: row.isUrgent ? "Sí" : "No",
      sentToHome: row.sentToHome ? "Sí" : "No",
    });
  });

  // 🔹 Estilos encabezados
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 20;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4472C4" }, // azul
    };
    cell.border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // Colores intercalados a las filas de datos
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // saltar encabezado

    const fillColor = rowNumber % 2 === 0 ? "F2F2F2" : "FFFFFF"; // gris claro y blanco
    row.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: fillColor },
      };
    });
  });

  return workbook.xlsx.writeBuffer();
}
