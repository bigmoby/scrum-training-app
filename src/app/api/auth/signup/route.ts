import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { nickname, email, password } = await request.json();

    if (!nickname || !email || !password) {
      return NextResponse.json({ error: 'Tutti i campi (nickname, email, password) sono obbligatori' }, { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await prisma.team.findUnique({
      where: { email: email.trim() }
    });
    if (existingEmail) {
      return NextResponse.json({ error: 'Esiste già un account con questa email' }, { status: 400 });
    }

    // Check if nickname already exists
    const existingNickname = await prisma.team.findUnique({
      where: { name: nickname.trim() }
    });

    if (existingNickname) {
      // Suggest an alternative nickname
      const randomSuffix = Math.floor(Math.random() * 1000);
      const suggestedNickname = `${nickname.trim()}_${randomSuffix}`;
      return NextResponse.json({ 
        error: 'Nickname non disponibile', 
        suggestedNickname 
      }, { status: 409 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create team
    const team = await prisma.team.create({
      data: { 
        name: nickname.trim(),
        email: email.trim(),
        password: hashedPassword
      },
    });

    let previewUrl = null;
    // Send email with nodemailer (Ethereal test account for dev purposes)
    try {
      // For a real app, use real SMTP credentials. Here we quickly create a test account or connect if env vars exist.
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
        to: email.trim(),
        subject: "Benvenuto in Scrum Cluedo!",
        text: `Ciao ${nickname.trim()},\n\nLa tua squadra è stata registrata con successo su Scrum Cluedo!\n\nHai effettuato l'accesso con l'indirizzo email: ${email.trim()}\n\nPer motivi di sicurezza, non includiamo la tua password in questa email.\nSe dovessi dimenticarla, potrai sempre utilizzare la funzione "Hai dimenticato la password?" nella pagina di login.\n\nPreparati a investigare sui peggiori anti-pattern Scrum!`,
        html: `<p>Ciao <b>${nickname.trim()}</b>,</p><p>La tua squadra è stata registrata con successo su Scrum Cluedo!</p><p>Hai effettuato l'accesso con l'indirizzo email: <b>${email.trim()}</b></p><br><p><i>Per motivi di sicurezza, non includiamo la tua password in questa email.</i><br>Se dovessi dimenticarla, potrai sempre utilizzare la funzione "Hai dimenticato la password?" nella pagina di login.</p><br><p>Preparati a investigare sui peggiori anti-pattern Scrum!</p>`,
      });
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Email mandata via Ethereal. URL di anteprima: %s", previewUrl);
    } catch (mailErr) {
      console.error("Errore invio email:", mailErr);
      // We don't fail the registration if email fails, but we log it
    }

    return NextResponse.json({ 
        success: true, 
        previewUrl,
        team: { id: team.id, name: team.name, totalScore: team.totalScore, isAdmin: team.isAdmin } 
    });
  } catch (error) {
    console.error('Error in signup route', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
