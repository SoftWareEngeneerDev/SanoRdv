// ===============================
// 📁 scripts/createAdmin.js
// ===============================

import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'readline';
import { createDefaultAdmin, listAdmins } from '../controllers/admin.controller.js';
import { testEmailConfig } from '../utils/email.admin.js';

// 🎨 Affichage coloré pour terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}🎯 ${msg}${colors.reset}`),
  separator: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise(resolve => rl.question(question, resolve));

// 🔧 Fonction principale d'initialisation
async function initializeAdmin() {
  try {
    log.title('INITIALISATION DES ADMINISTRATEURS SANO RDV');
    log.separator();

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sanoRdv';
    log.info('Connexion à MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    log.success('Connexion MongoDB établie');

    log.info('Vérification de la configuration email...');
    const emailTest = await testEmailConfig();
    if (emailTest.success) {
      log.success('Configuration email valide');
    } else {
      log.warning(`Email invalide: ${emailTest.message}`);
    }

    const adminsList = await listAdmins();
    if (adminsList.count > 0) {
      log.warning(`${adminsList.count} administrateur(s) déjà existant(s):`);
      adminsList.admins.forEach(admin => {
        console.log(`   - ${admin.IDadmin} (${admin.email})`);
      });
    }

    let again = true;
    while (again) {
      log.separator();
      const firstName = await ask('👤 Prénom: ');
      const lastName = await ask('👤 Nom: ');
      const email = await ask('📧 Email: ');
      const password = await ask('🔑 Mot de passe: ');

      const result = await createDefaultAdmin({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password: password.trim()
      });

      if (result.success) {
        log.success('Administrateur créé avec succès !');
        console.log(`   🆔 ID MongoDB: ${result.admin._id}`);
        console.log(`   👤 IDadmin: ${colors.cyan}${result.admin.IDadmin}${colors.reset}`);
        console.log(`   📧 Email: ${result.admin.email}`);
        console.log(`   🔑 Password: ${colors.yellow}${password.trim()}${colors.reset}`);
        console.log(`   📅 Créé le: ${new Date(result.admin.createdAt).toLocaleString()}`);
        if (result.emailSent) {
          log.success('Email envoyé avec succès');
        } else {
          log.warning('Email non envoyé');
        }
      } else {
        log.warning(`Erreur: ${result.message}`);
        if (result.admin) {
          console.log(`   Administrateur existant: ${result.admin.IDadmin} (${result.admin.email})`);
        }
      }

      const next = await ask('\nAjouter un autre administrateur ? (o/n): ');
      again = next.trim().toLowerCase() === 'o';
    }

  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    console.error(error.stack);
  } finally {
    rl.close();
    await mongoose.connection.close();
    log.info('Connexion MongoDB fermée');
  }
}

// 🎬 Gestion en CLI
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.cyan}🏥 SanoRdv - Création Administrateurs${colors.reset}

Usage: node scripts/createAdmin.js [options]

Options:
  --help, -h     Afficher cette aide
  --list, -l     Lister les admins existants uniquement

Variables d'environnement :
  MONGODB_URI    URI MongoDB
  GMAIL_USER     Email Gmail
  GMAIL_PASS     App Password Gmail

⚙️ Lancement standard :
  node scripts/createAdmin.js
`);
  process.exit(0);
} else if (args.includes('--list') || args.includes('-l')) {
  (async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sanoRdv');
    const adminsList = await listAdmins();
    log.title('LISTE DES ADMINISTRATEURS');
    log.separator();
    if (adminsList.count === 0) {
      log.warning('Aucun administrateur trouvé.');
    } else {
      adminsList.admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${colors.cyan}${admin.IDadmin}${colors.reset}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   📅 Créé: ${new Date(admin.createdAt).toLocaleString()}`);
        console.log(`   🔄 Modifié: ${new Date(admin.updatedAt).toLocaleString()}`);
        console.log(`   ✅ Actif: ${admin.isActive ? 'Oui' : 'Non'}`);
      });
    }
    await mongoose.connection.close();
  })();
} else {
  initializeAdmin();
}
