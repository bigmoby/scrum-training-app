import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.playSession.deleteMany();
  await prisma.case.deleteMany();

  // Create some Scrum Cluedo cases
  const cases = [
    // --- ITALIAN CASES ---
    {
      lang: "it",
      title: "Il Mistero del Lavoro Infinito",
      story: "Durante l'ultimo Sprint, nessuno sapeva esattamente cosa il team dovesse raggiungere. Ognuno lavorava su ticket scollegati tra loro scelti dal backlog senza una vera direzione. Alla fine dello Sprint, il team ha consegnato un po' di tutto ma nessun vero valore o funzionalità completa che aiutasse l'utente. Il morale era basso perché sembrava di correre su un tapis roulant senza arrivare da nessuna parte.",
      hint: "Senza una bussola, anche la nave più veloce si perde nell'oceano.",
      correctLocation: "Sprint Planning",
      explanationLocation: "L'obiettivo dello Sprint va definito durante lo Sprint Planning. È il momento in cui il team si allinea sul valore da consegnare.",
      correctSuspect: "PO",
      explanationSuspect: "Il Product Owner è responsabile di massimizzare il valore del prodotto e proporre un focus o obiettivo commerciale chiaro (Sprint Goal).",
      correctWeapon: "Sprint Goal",
      explanationWeapon: "Lo Sprint Goal assicura concentrazione e incoraggia il team a lavorare insieme piuttosto che su iniziative separate."
    },
    {
      lang: "it",
      title: "Lo Strano Caso dei Requisiti Mutanti",
      story: "A metà dello Sprint in corso, la direzione del prodotto ha deciso di aggiungere due nuove funzionalità molto urgenti da rilasciare immediatamente. Il team ha dovuto mettere in pausa i lavori in corso, iniziare i nuovi sviluppi e ha fallito completamente l'obiettivo originale dello Sprint. Alcuni test sono stati saltati per la fretta.",
      hint: "Lo scopo dello Sprint è proteggere il team garantendogli la concentrazione.",
      correctLocation: "During Sprint",
      explanationLocation: "Il problema si è verificato durante lo svolgimento dello Sprint, alterando il piano di lavoro concordato e mettendo a rischio lo Sprint Goal.",
      correctSuspect: "PO",
      explanationSuspect: "Il Product Owner è l'unico che può modificare lo scope dello Sprint o negoziare una cancellazione; non ha protetto il team e l'obiettivo concordato di fronte alle pressioni esterne.",
      correctWeapon: "Sprint Goal",
      explanationWeapon: "Lo Sprint Goal è l'impegno che protegge la concentrazione del team per tutta la durata dello Sprint; ignorarlo o abbandonarlo è l'antipattern che ha causato il fallimento."
    },
    {
      lang: "it",
      title: "Il Caso dell'Isola che Non C'è",
      story: "Si è appena concluso lo Sprint e il team sta mostrando il lavoro fatto all'evento finale. Tutto sembra funzionare a dovere nel codice locale di ogni sviluppatore, ma non appena viene chiesto di vedere il prodotto in un ambiente reale (staging o produzione), il team ammette che 'è quasi finito ma mancano solo i test e il deploy'. Di fatto l'incremento non è rilasciabile.",
      hint: "Se non c'è una chiara regola condivisa su quando un lavoro può dirsi completato, allora niente è main finito.",
      correctLocation: "Sprint Review",
      explanationLocation: "Durante la Sprint Review viene esaminato solo l'Incremento 'Finito'. Non si dovrebbe portare lavoro parziale non rilasciabile.",
      correctSuspect: "DEV Team",
      explanationSuspect: "Spetta ai Developers garantire e applicare tutele di qualità (Definition of Done) trasformando gli item in un incremento utilizzabile.",
      correctWeapon: "Definition of Done",
      explanationWeapon: "Ignorare la Definition of Done porta a discrepanze su cosa significhi 'terminare un task', generando debito tecnico e inaffidabilità."
    },
    {
      lang: "it",
      title: "Il Riassunto Silenzioso",
      story: "Alla fine di uno Sprint difficile, il team si è incontrato per l'evento dedicato al miglioramento continuo. Tuttavia, la riunione è durata a stento dieci minuti. Nessuno ha parlato dei veri problemi relativi alla qualità del codice esplosi in produzione e si è conclusa con un generico 'cercheremo di fare meglio'.",
      hint: "Un evento agile che serva ad ispezionare e adattare i processi.",
      correctLocation: "Retrospective",
      explanationLocation: "L'evento in cui il team riflette e parla di miglioramento dei processi è chiaramente la Sprint Retrospective.",
      correctSuspect: "Scrum Master",
      explanationSuspect: "È co-responsabilità dello Scrum Master far sì che gli eventi Scrum si svolgano e siano produttivi, facilitando dialoghi complessi.",
      correctWeapon: "Sprint Backlog",
      explanationWeapon: "Senza sicurezza psicologica il team evita di discutere apertamente i problemi; il sintomo più visibile è uno Sprint Backlog che non viene mai adattato e nasconde gli impedimenti reali."
    },
    // --- ENGLISH CASES ---
    {
      lang: "en",
      title: "The Mystery of Infinite Work",
      story: "During the last Sprint, no one knew exactly what the team was supposed to achieve. Everyone worked on disconnected tickets picked from the backlog without real direction. At the end of the Sprint, the team delivered a bit of everything but no real value or complete feature that helped the user. Morale was low because it felt like running on a treadmill going nowhere.",
      hint: "Without a compass, even the fastest ship gets lost in the ocean.",
      correctLocation: "Sprint Planning",
      explanationLocation: "The Sprint goal should be defined during the Sprint Planning. It is the moment when the team aligns on the value to deliver.",
      correctSuspect: "PO",
      explanationSuspect: "The Product Owner is responsible for maximizing product value and proposing a clear commercial focus (Sprint Goal).",
      correctWeapon: "Sprint Goal",
      explanationWeapon: "The Sprint Goal ensures concentration and encourages the team to work together rather than on separate initiatives."
    },
    {
      lang: "en",
      title: "The Strange Case of Mutant Requirements",
      story: "Halfway through the current Sprint, product management decided to add two new very urgent features to be released immediately. The team had to pause their ongoing work, start the new developments, and completely failed the original Sprint goal. Some tests were skipped due to the rush.",
      hint: "The purpose of the Sprint is to protect the team by guaranteeing them concentration.",
      correctLocation: "During Sprint",
      explanationLocation: "The problem occurred during the execution of the Sprint, altering the agreed-upon work plan and putting the Sprint Goal at risk.",
      correctSuspect: "PO",
      explanationSuspect: "The Product Owner is the only one who can modify the Sprint scope or negotiate a cancellation; they failed to protect the team and the agreed goal when facing external pressure.",
      correctWeapon: "Sprint Goal",
      explanationWeapon: "The Sprint Goal is the commitment that protects the team's focus for the entire Sprint; ignoring or abandoning it is the anti-pattern that caused the failure."
    },
    {
      lang: "en",
      title: "The Case of Neverland",
      story: "The Sprint has just ended and the team is showing the work done at the final event. Everything seems to work properly in each developer's local code, but as soon as they are asked to see the product in a real environment (staging or production), the team admits that 'it's almost finished but only lacks tests and deployment'. In fact, the increment is not releasable.",
      hint: "If there is no clear shared rule on when a job can be called completed, then nothing is ever really finished.",
      correctLocation: "Sprint Review",
      explanationLocation: "During the Sprint Review, only the 'Done' Increment is examined. Non-releasable partial work should not be brought here.",
      correctSuspect: "DEV Team",
      explanationSuspect: "It is up to the Developers to ensure and apply quality safeguards (Definition of Done) turning items into a usable increment.",
      correctWeapon: "Definition of Done",
      explanationWeapon: "Ignoring the Definition of Done leads to discrepancies on what 'finishing a task' means, generating technical debt and unreliability."
    },
    {
      lang: "en",
      title: "The Silent Summary",
      story: "At the end of a difficult Sprint, the team met for the event dedicated to continuous improvement. However, the meeting barely lasted ten minutes. Nobody talked about the real problems regarding code quality that exploded in production and it ended with a generic 'we'll try to do better'.",
      hint: "An agile event used to inspect and adapt processes.",
      correctLocation: "Retrospective",
      explanationLocation: "The event where the team reflects and talks about process improvement is clearly the Sprint Retrospective.",
      correctSuspect: "Scrum Master",
      explanationSuspect: "It is the Scrum Master's co-responsibility to ensure that Scrum events take place and are productive, facilitating complex dialogues.",
      correctWeapon: "Sprint Backlog",
      explanationWeapon: "Without psychological safety the team avoids openly discussing problems; the clearest symptom is a Sprint Backlog that is never adapted and that hides real impediments."
    },
    {
      lang: "it",
      title: "Il Caso dei Silos Tecnologici",
      story: "L'azienda sta passando a Scrum. Per evitare 'troppo scompiglio' iniziale, il management ha deciso di mantenere i team divisi per competenza tecnica: un team per il front-end, uno per il back-end e uno per i database. Durante lo Sprint, ogni team ha lavorato duramente sui propri pezzi, ma alla fine non c'era nulla di funzionante da mostrare agli stakeholder. Il valore aziendale è rimasto bloccato tra infinite dipendenze e passaggi di consegne (handovers).",
      hint: "Spesso la fretta di non voler 'disturbare' l'organizzazione esistente porta a mantenere strutture che impediscono la creazione di un Incremento 'Fatto'.",
      correctLocation: "During Sprint",
      explanationLocation: "Il problema esplode durante lo Sprint: la mancanza di cross-funzionalità impedisce al team di avanzare in modo autonomo verso l'obiettivo.",
      correctSuspect: "Scrum Master",
      explanationSuspect: "Lo Scrum Master ha la responsabilità di promuovere team cross-funzionali e auto-organizzati, guidando l'organizzazione nella transizione verso Feature Team.",
      correctWeapon: "Increment",
      explanationWeapon: "L'Incremento è l'elemento mancante; senza un pezzo di software finito e funzionante, lo Sprint fallisce il suo scopo principale."
    },
    {
      lang: "en",
      title: "The Case of the Functional Silos",
      story: "The organization is transitioning to Scrum. To avoid 'initial disruption,' management decided to keep teams organized by software layers: front-end, back-end, and database (Component Teams). During the Sprint, each team worked hard on its tasks, but at the end, there was no working software to demonstrate to stakeholders. Business value was trapped in endless dependencies and handovers.",
      hint: "Keeping the status quo to avoid friction often results in structures that prevent the creation of a 'Done' Increment.",
      correctLocation: "During Sprint",
      explanationLocation: "The issue surfaces during the Sprint: a lack of cross-functionality prevents teams from moving autonomously toward the goal.",
      correctSuspect: "Scrum Master",
      explanationSuspect: "The Scrum Master has the responsibility to promote cross-functional and self-managing teams, guiding the organization in transitioning toward Feature Teams.",
      correctWeapon: "Increment",
      explanationWeapon: "The Increment is the victim here; without a finished and working piece of software, the Sprint fails its primary purpose."
    },
    // --- PSM II BASED CASES ---
    {
      lang: "it",
      title: "Il Caso del Proprietario Fantasma",
      story: "Socrates (il PO) è sempre troppo impegnato con gli stakeholder e non si presenta mai alle sessioni di Refinement o Sprint Planning. I Developer hanno cercato di interpretare il Backlog da soli, ma allo Sprint Review il risultato è stato un disastro: l'Incremento non serve a nulla e non rispecchia le necessità del mercato. I Developer dicono di non averlo voluto 'disturbare'.",
      hint: "Senza la presenza della persona che guida il valore, il team naviga alla cieca.",
      correctLocation: "Sprint Planning",
      explanationLocation: "Lo Sprint Planning richiede la collaborazione di tutto lo Scrum Team. Senza il PO, non si può definire un obiettivo di valore.",
      correctSuspect: "PO",
      explanationSuspect: "Il Product Owner deve essere disponibile per il team; la sua assenza è la causa principale del disallineamento.",
      correctWeapon: "Product Backlog",
      explanationWeapon: "Il Backlog non è stato rifinito né spiegato, diventando un'arma contundente contro l'efficacia del team."
    },
    {
      lang: "en",
      title: "The Case of the Ghost Owner",
      story: "Socrates (the PO) is always too busy with stakeholders and never shows up for Refinement or Sprint Planning sessions. The Developers tried to interpret the Backlog on their own, but at the Sprint Review, the result was a disaster: the Increment is useless and doesn't meet market needs. Developers said they didn't want to 'bother' him.",
      hint: "Without the presence of the person driving the value, the team is sailing blind.",
      correctLocation: "Sprint Planning",
      explanationLocation: "Sprint Planning requires the collaboration of the entire Scrum Team. Without the PO, a valuable Sprint Goal cannot be defined.",
      correctSuspect: "PO",
      explanationSuspect: "The Product Owner must be available to the team; their absence is the root cause of the misalignment.",
      correctWeapon: "Product Backlog",
      explanationWeapon: "The Backlog was neither refined nor explained, becoming an obstacle to the team's effectiveness."
    },
    {
      lang: "it",
      title: "Il Caso del Silenzio Colpevole",
      story: "Durante lo Sprint, un errore nel database ha causato un'incoerenza dei dati critica. Il Developer che ha commesso l'errore ha avuto paura di parlarne, sperando di risolverlo in segreto, e non ha detto nulla durante il Daily Scrum. Il problema è emerso solo quando il sistema è andato in crash totale poco prima della Review.",
      hint: "La trasparenza è un pilastro di Scrum; nascondere la polvere sotto il tappeto non aiuta mai.",
      correctLocation: "Daily Scrum",
      explanationLocation: "Il Daily Scrum è il momento in cui gli ostacoli devono essere portati alla luce per permettere l'ispessimento e l'adattamento.",
      correctSuspect: "DEV Team",
      explanationSuspect: "I Developer hanno la responsabilità della trasparenza tecnica verso i colleghi per risolvere i problemi collettivamente.",
      correctWeapon: "Sprint Backlog",
      explanationWeapon: "Il Developer non ha aggiornato lo Sprint Backlog per rendere visibile l'impedimento. Lo Sprint Backlog è l'artefatto che deve rivelare la verità sul progresso e i rischi dello Sprint."
    },
    {
      lang: "en",
      title: "The Case of the Guilty Silence",
      story: "During the Sprint, a database error caused critical data inconsistency. The Developer who made the mistake was afraid to talk about it, hoping to fix it in secret, and said nothing during the Daily Scrum. The problem emerged only when the system crashed completely just before the Review.",
      hint: "Transparency is a pillar of Scrum; hiding dirt under the rug never helps.",
      correctLocation: "Daily Scrum",
      explanationLocation: "The Daily Scrum is the moment when impediments must be brought to light to allow for inspection and adaptation.",
      correctSuspect: "DEV Team",
      explanationSuspect: "Developers have a responsibility for technical transparency toward their peers to solve problems collectively.",
      correctWeapon: "Sprint Backlog",
      explanationWeapon: "The Developer failed to update the Sprint Backlog to make the impediment visible. The Sprint Backlog is the artifact that must reveal the truth about progress and Sprint risks."
    },
    {
      lang: "it",
      title: "Il Caso del Circolo ristretto",
      story: "Mariana (lo Scrum Master) ha notato che il PO si confronta sempre e solo con lo stesso gruppetto di 4 Developer per definire i futuri lavori. Il resto del team si sente escluso e non capisce la direzione del prodotto, limitandosi a eseguire task senza contesto. Questo sta creando un team a 'due velocità'.",
      hint: "L'attività di Refinement dovrebbe coinvolgere e attivare l'intero team, non solo un'élite.",
      correctLocation: "Refinement",
      explanationLocation: "Il Refinement è un'attività del team; escludere membri riduce l'intelligenza collettiva del gruppo.",
      correctSuspect: "PO",
      explanationSuspect: "Il PO non dovrebbe creare barriere o circoli ristretti, ma favorire la comprensione condivisa di tutti.",
      correctWeapon: "Product Backlog",
      explanationWeapon: "Il modo in cui viene gestito il Backlog è diventato un mezzo di esclusione invece che uno strumento di allineamento."
    },
    {
      lang: "en",
      title: "The Case of the Inner Circle",
      story: "Mariana (the Scrum Master) noticed that the PO always and only consults with the same group of 4 Developers to define future work. The rest of the team feels excluded and doesn't understand the product direction, just executing tasks without context. This is creating a 'two-speed' team.",
      hint: "Refinement activities should engage the entire team, not just an elite group.",
      correctLocation: "Refinement",
      explanationLocation: "Refinement is a team activity; excluding members reduces the collective intelligence of the group.",
      correctSuspect: "PO",
      explanationSuspect: "The PO should not create barriers or inner circles, but foster shared understanding among everyone.",
      correctWeapon: "Product Backlog",
      explanationWeapon: "The way the Backlog is managed has become a means of exclusion rather than an alignment tool."
    },
    {
      lang: "it",
      title: "Il Muro dell'Imprevisto",
      story: "Durante lo Sprint, il team ha incontrato diverse sfide impreviste che hanno rallentato lo sviluppo. Invece di discutere il problema e adattare il Piano, il team ha deciso di lavorare ore extra ogni sera per cercare di rispettare l'impegno iniziale, senza però avvertire nessuno degli ostacoli incontrati.",
      hint: "Agilità non significa fare sforzi eroici last-minute, ma ispezionare e adattare costantemente.",
      correctLocation: "Daily Scrum",
      explanationLocation: "Il Daily Scrum è il momento chiave per segnalare ostacoli e adattare lo Sprint Backlog se necessario.",
      correctSuspect: "DEV Team",
      explanationSuspect: "I Developer devono essere i primi a sollevare i problemi e collaborare per trovare soluzioni durante lo Sprint invece di subire i ritardi.",
      correctWeapon: "Sprint Backlog",
      explanationWeapon: "Lo Sprint Backlog è un piano flessibile; non adattarlo davanti a imprevisti è un errore che porta al fallimento del valore."
    },
    {
      lang: "en",
      title: "The Wall of the Unforeseen",
      story: "During the Sprint, the team encountered several unforeseen challenges that slowed down development. Instead of discussing the problem and adapting the Plan, the team decided to work overtime every evening to try to meet the initial commitment, without mentioning the obstacles to anyone.",
      hint: "Agility doesn't mean last-minute heroic efforts, but constant inspection and adaptation.",
      correctLocation: "Daily Scrum",
      explanationLocation: "The Daily Scrum is the key moment to flag obstacles and adapt the Sprint Backlog if necessary.",
      correctSuspect: "DEV Team",
      explanationSuspect: "Developers must be the first to bring up issues and collaborate on solutions during the Sprint instead of just absorbing delays.",
      correctWeapon: "Sprint Backlog",
      explanationWeapon: "The Sprint Backlog is a flexible plan; failing to adapt it when unforeseen challenges arise is a mistake that compromises value."
    },
    {
      lang: "it",
      title: "Il Caso della Review Mancata",
      story: "Primo Sprint Review per un nuovo team. Il PO è visibilmente deluso: l'Incremento non rispecchia minimamente le sue aspettative. I Developer si difendono dicendo: 'Abbiamo seguito le descrizioni del backlog. Sapevamo che c'erano dubbi, ma sembravi così impegnato che non volevamo disturbarti'.",
      hint: "Un valore fondamentale di Scrum è stato ignorato: la trasparenza richiede coraggio e apertura.",
      correctLocation: "Sprint Review",
      explanationLocation: "L'esito del disastro si manifesta alla Review, ma la causa è la mancata interazione durante tutto lo Sprint.",
      correctSuspect: "Scrum Master",
      explanationSuspect: "Lo Scrum Master ha fallito nel coadiuvare i valori di Scrum, non incoraggiando i Developer a essere aperti e a collaborare col PO.",
      correctWeapon: "Product Backlog",
      explanationWeapon: "Il Product Backlog incompleto o mal curato non era abbastanza chiaro per permettere ai Developer di capire il valore da consegnare. Il PO aveva il compito di renderlo trasparente."
    },
    {
      lang: "en",
      title: "The Case of the Missing Alignment",
      story: "First Sprint Review for a new team. The PO is visibly disappointed: the Increment doesn't meet expectations. The Developers defend themselves: 'We followed the backlog descriptions. We knew there were doubts, but you seemed so busy we didn't want to bother you'.",
      hint: "A fundamental Scrum value was ignored: transparency requires courage and openness.",
      correctLocation: "Sprint Review",
      explanationLocation: "The outcome of the disaster manifests at the Review, but the root cause is the lack of interaction throughout the Sprint.",
      correctSuspect: "Scrum Master",
      explanationSuspect: "The Scrum Master failed to coach the Scrum values, not encouraging Developers to be open and collaborate with the PO.",
      correctWeapon: "Product Backlog",
      explanationWeapon: "An incomplete or poorly maintained Product Backlog was not clear enough for Developers to understand the value to deliver. It was the PO's job to make it transparent."
    }
  ];

  for (const c of cases) {
    await prisma.case.create({
      data: c,
    });
  }

  // Create an Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.team.upsert({
    where: { name: 'Admin Team' },
    update: { isAdmin: true, password: adminPassword, email: 'admin@scrumgame.com' },
    create: {
      name: 'Admin Team',
      email: 'admin@scrumgame.com',
      password: adminPassword,
      isAdmin: true,
    }
  });

  console.log('Seed db completed with', cases.length, 'cases and 1 admin team.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
