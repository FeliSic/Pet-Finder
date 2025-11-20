"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
console.log('RESEND_KEY:', process.env.RESEND_KEY);
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_KEY);
const sendEmail = async (emailData) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'Pet Finder <onboarding@resend.dev>', // Cambiar cuando tengas dominio propio
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
        });
        if (error) {
            console.error('Error al enviar email:', error);
            throw error;
        }
        console.log('Email enviado exitosamente:', data);
        return data;
    }
    catch (error) {
        console.error('Error en sendEmail:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
