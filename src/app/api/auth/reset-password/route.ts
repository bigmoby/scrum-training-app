import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword || newPassword.trim() === '') {
      return NextResponse.json({ error: 'Token e nuova password sono obbligatori' }, { status: 400 });
    }

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { team: true }
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Token di recupero non valido' }, { status: 400 });
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Il link di recupero è scaduto. Richiedine uno nuovo.' }, { status: 400 });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and delete ALL their reset tokens
    await prisma.$transaction([
      prisma.team.update({
        where: { id: resetToken.teamId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.deleteMany({
        where: { teamId: resetToken.teamId }
      })
    ]);

    // Send confirmation email
    let previewUrl = null;
    try {
      if (resetToken.team.email) {
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

        const info = await transporter.sendMail({
          from: '"Scrum Cluedo" <noreply@scrumcluedo.local>',
          to: resetToken.team.email,
          subject: "Password Modificata con Successo - Scrum Cluedo",
          text: `Ciao ${resetToken.team.name},\n\nTi confermiamo che la password del tuo account è stata appena modificata con successo.\n\nSe non sei stato tu, contatta l'amministratore.\n\nBuona indagine!`,
          html: `<p>Ciao <b>${resetToken.team.name}</b>,</p><p>Ti confermiamo che la password del tuo account è stata appena modificata con successo.</p><p>Se non sei stato tu, contatta l'amministratore.</p><p>Buona indagine!</p>`,
        });
        
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Password Success Email mandata via Ethereal. URL di anteprima: %s", previewUrl);
      }
    } catch (mailErr) {
      console.error("Errore invio email conferma:", mailErr);
      // We don't fail the password reset if the email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password aggiornata con successo',
      previewUrl 
    });
  } catch (error) {
    console.error('Error in reset-password route', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
