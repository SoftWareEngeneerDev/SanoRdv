import 'dotenv/config';
import mongoose from 'mongoose';
import { createDefaultAdmin, listAdmins } from '../controllers/admin.controller.js';
import { testEmailConfig } from '../utils/email.admin.js';
import readline from 'readline';

// 🎨 Fonctions pour l'affichage coloré
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}🎯 ${msg}${colors.reset}`),
  separator: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

// 🔧 Fonction pour demander une entrée utilisateur
function askQuestion(query, hideInput = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    if (hideInput) {
      const stdin = process.openStdin();
      process.stdin.on('data', char => {
        const str = char.toString();
        if (str === '\r' || str === '\n') {
          process.stdin.pause();
        } else {
          readline.clearLine(process.stdout, 0);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(query + Array(rl.line.length + 1).join('*'));
        }
      });
    }

    rl.question(query, ans => {
      rl.close();
      resolve(ans);
    });
  });
}

// 🔧 Fonction principale
async function createAdminInteractive() {
  try {
    log.title('CRÉATION D\'UN NOUVEL ADMINISTRATEUR SANO RDV');
    log.separator();
    
    // 1. Connexion à MongoDB
    log.info('Connexion à la base de données...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sanoRdv';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    log.success('Connexion à MongoDB établie');
    
    // 2. Tester la configuration email (optionnel)
    log.info('Vérification de la configuration email...');
    const emailTest = await testEmailConfig();
    if (emailTest.success) {
      log.success('Configuration email valide');
    } else {
      log.warning(`Problème de configuration email: ${emailTest.message}`);
    }
    
    // 3. Vérifier les admins existants
    log.info('Vérification des administrateurs existants...');
    const adminsList = await listAdmins();
    
    if (adminsList.count > 0) {
      log.warning(`${adminsList.count} administrateur(s) déjà présent(s) dans le système.`);
    }
    
    // 4. Saisie interactive des informations
    log.separator();
    log.title('SAISIE DES INFORMATIONS ADMINISTRATEUR');
    
    const IDadmin = `ADMIN_${Math.floor(10000 + Math.random() * 90000)}`;
    
    const prenom = await askQuestion(`${colors.blue}• Prénom : ${colors.reset}`);
    const nom = await askQuestion(`${colors.blue}• Nom : ${colors.reset}`);
    const email = await askQuestion(`${colors.blue}• Adresse email : ${colors.reset}`);
    const password = await askQuestion(`${colors.blue}• Mot de passe : ${colors.reset}`, true);
    const datenaissance = await askQuestion(`${colors.blue}• Date de naissance (YYYY-MM-DD) [optionnel] : ${colors.reset}`);
    const adresse = await askQuestion(`${colors.blue}• Adresse [optionnel] : ${colors.reset}`);
    const localite = await askQuestion(`${colors.blue}• Localité [optionnel] : ${colors.reset}`);
    
    // 5. Confirmation
    log.separator();
    log.title('RÉCAPITULATIF');
    console.log(`${colors.cyan}• ID Admin : ${IDadmin}`);
    console.log(`${colors.cyan}• Nom complet : ${prenom} ${nom}`);
    console.log(`${colors.cyan}• Email : ${email}`);
    console.log(`${colors.cyan}• Mot de passe : ${'*'.repeat(password.length)}`);
    if (datenaissance) console.log(`${colors.cyan}• Date de naissance : ${datenaissance}`);
    if (adresse) console.log(`${colors.cyan}• Adresse : ${adresse}`);
    if (localite) console.log(`${colors.cyan}• Localité : ${localite}`);
    
    const confirm = await askQuestion(`${colors.yellow}Confirmez-vous la création ? (O/n) : ${colors.reset}`);
    
    if (confirm.toLowerCase() !== 'o' && confirm !== '') {
      log.warning('Création annulée');
      process.exit(0);
    }
    
    // 6. Création de l'admin
    log.info('Création du compte administrateur en cours...');
    const additionalInfo = {
      IDadmin,
      prenom,
      nom,
      ...(datenaissance && { datenaissance: new Date(datenaissance) }),
      ...(adresse && { adresse }),
      ...(localite && { localite }),
      role: 'admin'
    };
    
    const result = await createDefaultAdmin(email, password, additionalInfo);
    
    if (result.success) {
      log.separator();
      log.success('COMPTE ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');
      log.separator();
      
      console.log(`${colors.white}📋 INFORMATIONS :${colors.reset}`);
      console.log(`   🆔 ${IDadmin}`);
      console.log(`   👤 ${prenom} ${nom}`);
      console.log(`   📧 ${email}`);
      console.log(`   📅 Créé le : ${result.admin.createdAt.toLocaleString()}`);
      
      if (result.emailSent) {
        log.success('Un email avec les identifiants a été envoyé');
      } else {
        log.warning('Email non envoyé - Notez bien les informations ci-dessus');
      }
      
      log.separator();
      log.warning('⚠️  CONSIGNES DE SÉCURITÉ :');
      console.log(`   • Changez le mot de passe dès la première connexion`);
      console.log(`   • Ne partagez jamais ces informations`);
      console.log(`   • Conservez-les en lieu sûr`);
      log.separator();
    } else {
      throw new Error(result.message || 'Erreur lors de la création du compte');
    }
    
  } catch (error) {
    log.error(`ERREUR : ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log.info('Déconnexion de MongoDB');
    }
  }
}

// 🎬 Point d'entrée principal
(async () => {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.cyan}🏥 SanoRdv - Création d'administrateur${colors.reset}

Usage: node scripts/createAdmin.js

Ce script guide interactivement la création d'un nouveau compte administrateur.

Variables d'environnement requises:
  MONGODB_URI    URI de connexion MongoDB

Configuration email optionnelle:
  SMTP_HOST      Serveur SMTP
  SMTP_PORT      Port SMTP
  SMTP_USER      Utilisateur SMTP
  SMTP_PASS      Mot de passe SMTP
  `);
    process.exit(0);
  }

  await createAdminInteractive();
})();