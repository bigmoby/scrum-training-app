import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || email.trim() === '') {
      return NextResponse.json({ error: 'Inserisci un indirizzo email valido' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { email: email.trim() },
    });

    // We don't want to reveal if an email exists or not for security reasons
    // But for this prototype we'll return an error if not found to help the user
    if (!team) {
      return NextResponse.json({ error: 'Nessun account trovato per questa email' }, { status: 404 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        expiresAt: resetTokenExpires,
        teamId: team.id,
      },
    });

    // Send email
    let previewUrl = null;
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });

      // Construct reset URL 
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      const info = await transporter.sendMail({
        from: '"Scrum Cluedo" <noreply@scrumcluedo.local>',
        to: email.trim(),
        subject: "Recupero Password - Scrum Cluedo",
        text: `Ciao ${team.name},\n\nHai richiesto il ripristino della password.\nClicca il link seguente per scegliere una nuova password:\n\n${resetUrl}\n\nIl link scadrà tra un'ora. Se non hai richiesto il reset, ignora questa email.`,
        html: `<p>Ciao <b>${team.name}</b>,</p><p>Hai richiesto il ripristino della password.</p><p><a href="${resetUrl}">Clicca qui per scegliere una nuova password</a></p><p>Il link scadrà tra un'ora. Se non hai richiesto il reset, ignora questa email.</p>`,
      });
      
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Password Reset Email mandata via Ethereal. URL di anteprima: %s", previewUrl);
    } catch (mailErr) {
      console.error("Errore invio email reset:", mailErr);
      return NextResponse.json({ error: 'Impossibile inviare la mail di recupero' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      previewUrl
    });
  } catch (error) {
    console.error('Error in forgot-password route', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
