import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('RESEND_KEY:', process.env.RESEND_KEY);

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (emailData: EmailData) => {
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
  } catch (error) {
    console.error('Error en sendEmail:', error);
    throw error;
  }
};