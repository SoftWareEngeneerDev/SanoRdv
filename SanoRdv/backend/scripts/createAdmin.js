// scripts/createAdmin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { createDefaultAdmin, listAdmins } from '../controllers/admin.controller.js';
import { testEmailConfig } from '../utils/email.admin.js';

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

// 🔧 Fonction principale
async function initializeAdmin() {
  try {
    log.title('INITIALISATION ADMINISTRATEUR SANO RDV');
    log.separator();
    
    // 1. Connexion à MongoDB
    log.info('Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sanoRdv';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    log.success('Connexion MongoDB établie');
    
    // 2. Tester la configuration email (optionnel)
    log.info('Test configuration email...');
    const emailTest = await testEmailConfig();
    if (emailTest.success) {
      log.success('Configuration email valide');
    } else {
      log.warning(`Configuration email: ${emailTest.message}`);
      log.info('Les identifiants seront affichés dans la console uniquement');
    }
    
    // 3. Vérifier les admins existants
    log.info('Vérification des administrateurs existants...');
    const adminsList = await listAdmins();
    
    if (adminsList.count > 0) {
      log.warning(`${adminsList.count} administrateur(s) déjà présent(s):`);
      adminsList.admins.forEach(admin => {
        console.log(`   - ${admin.username} (${admin.email}) - Créé le ${admin.createdAt.toLocaleDateString()}`);
      });
    }
    
    // 4. Créer nouvel admin
    log.info('Création du nouvel administrateur...');
    
    const adminEmail = process.env.ADMIN_EMAIL || null;
    const adminPassword = process.env.ADMIN_PASSWORD || null;
    
    if (!adminEmail) {
      log.warning('⚠️ ADMIN_EMAIL non défini dans les variables d\'environnement.');
    }
    
    const result = await createDefaultAdmin(adminEmail, adminPassword);
    
    if (result.success) {
      log.separator();
      log.success('ADMINISTRATEUR CRÉÉ AVEC SUCCÈS !');
      log.separator();
      
      console.log(`${colors.white}📋 INFORMATIONS ADMINISTRATEUR:${colors.reset}`);
      console.log(`   🆔 ID: ${result.admin.id}`);
      console.log(`   👤 Username: ${colors.cyan}${result.admin.username}${colors.reset}`);
      console.log(`   📧 Email: ${colors.cyan}${result.admin.email}${colors.reset}`);
      console.log(`   🔑 Password: ${colors.yellow}${result.admin.password}${colors.reset}`);
      console.log(`   📅 Créé le: ${result.admin.createdAt.toLocaleString()}`);
      
      if (result.emailSent) {
        log.success('Email avec identifiants envoyé');
      } else {
        log.warning('Email non envoyé - Sauvegardez ces identifiants !');
      }
      
      log.separator();
      console.log(`${colors.red}⚠️  IMPORTANT:${colors.reset}`);
      console.log(`   • Sauvegardez ces identifiants en lieu sûr`);
      console.log(`   • Changez le mot de passe dès la première connexion`);
      console.log(`   • Ne partagez jamais ces informations`);
      log.separator();
      
    } else {
      log.warning(result.message);
      if (result.admin) {
        console.log(`   Administrateur existant: ${result.admin.username} (${result.admin.email})`);
      }
    }
    
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Fermer la connexion MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      log.info('Connexion MongoDB fermée');
    }
  }
}

// 🎬 Gestion des arguments de ligne de commande
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${colors.cyan}🏥 SanoRdv - Création Administrateur${colors.reset}

Usage: node scripts/createAdmin.js [options]

Options:
  --help, -h     Afficher cette aide
  --force, -f    Forcer la création même si un admin existe
  --list, -l     Lister les admins existants uniquement

Variables d'environnement requises:
  MONGODB_URI    URI de connexion MongoDB
  ADMIN_EMAIL    Email de l'administrateur (optionnel)
  ADMIN_PASSWORD Mot de passe de l'administrateur (optionnel)
  
Variables d'environnement email (optionnelles):
  GMAIL_USER     Utilisateur Gmail
  GMAIL_PASS     Mot de passe d'application Gmail
  ou
  SMTP_HOST      Serveur SMTP
  SMTP_PORT      Port SMTP
  SMTP_USER      Utilisateur SMTP
  SMTP_PASS      Mot de passe SMTP

Exemple:
  node scripts/createAdmin.js
  `);
  process.exit(0);
}

if (args.includes('--list') || args.includes('-l')) {
  // Mode liste uniquement
  async function listOnly() {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sanoRdv');
      const adminsList = await listAdmins();
      
      log.title('LISTE DES ADMINISTRATEURS');
      log.separator();
      
      if (adminsList.count === 0) {
        log.warning('Aucun administrateur trouvé');
      } else {
        console.log(`${colors.green}${adminsList.count} administrateur(s) trouvé(s):${colors.reset}`);
        adminsList.admins.forEach((admin, index) => {
          console.log(`\n${index + 1}. ${colors.cyan}${admin.username}${colors.reset}`);
          console.log(`   📧 Email: ${admin.email}`);
          console.log(`   📅 Créé: ${admin.createdAt.toLocaleString()}`);
          console.log(`   🔄 Modifié: ${admin.updatedAt.toLocaleString()}`);
          console.log(`   ✅ Actif: ${admin.isActive ? 'Oui' : 'Non'}`);
        });
      }
    } catch (error) {
      log.error(`Erreur: ${error.message}`);
    } finally {
      await mongoose.connection.close();
    }
  }
  listOnly();
} else {
  // Mode création normale
  initializeAdmin();
}
