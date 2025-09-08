// src/interfaces/managementEntrega.ts
export interface ManagementEntrega {
    radicadoTipoNumero: string;      // GestionesEntregasPendientes.radicado_tipo_numero
    nombrePaciente: string;          // DatosPacientesDomicilios.nombre_paciente
    identificacion: string;          // DatosPacientesDomicilios.identificacion
    contacto1: string;               // DatosPacientesDomicilios.contacto1
    contacto2?: string | null;       // DatosPacientesDomicilios.contacto2
    correo?: string | null;          // DatosPacientesDomicilios.correo
    direccion: string;               // DatosPacientesDomicilios.direccion

    fechaGestion: string;            // ISO string (DATE en SQL)
    horaGestion: string;             // HH:mm:ss (TIME en SQL)

    fechaDomicilio?: string | null;  // DATE opcional (puede no seleccionarse)
    horaDomicilio?: string | null;   // TIME opcional (puede no seleccionarse)

    tipoEmpaque: string;          // GestionesEntregasPendientes.tipo_empaque
    resultadoLlamada: string;        // GestionesEntregasPendientes.resultado_llamada
    observaciones?: string | null;   // GestionesEntregasPendientes.observaciones
    regenteId: string;               // GestionesEntregasPendientes.regente_id (NOT NULL en SQL)
    esUrgente?: boolean;             // Indica si la entrega es urgente
    enviado_a_domicilio: boolean;    // Indica si la entrega ha sido enviada a domicilio
}
            