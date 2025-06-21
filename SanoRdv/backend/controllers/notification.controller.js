/**
 * Envoie la notification selon son canal
 */
notificationSchema.methods.envoyer = async function() {
  try {
    // 1. Récupérer le RDV avec ses relations
    const rdv = await mongoose.model('RendezVous')
      .findById(this.rendezVous)
      .populate('patient medecin');

    if (!rdv) throw new Error('Rendez-vous introuvable');

    // 2. Envoi selon le canal
    switch(this.canal) {
      case 'Email':
        await this._envoyerEmail(rdv);
        break;
      case 'SMS':
        await this._envoyerSMS(rdv);
        break;
    }

    // 3. Mise à jour du statut
    this.statut = 'Envoyé';
    await this.save();
    return true;

  } catch (err) {
    this.statut = 'Échec';
    this.erreur = err.message.substring(0, 200);
    this.tentatives += 1;
    await this.save();
    throw err;
  }
};

// Méthode privée pour l'email
notificationSchema.methods._envoyerEmail = async function(rdv) {
  const destinataire = this._getDestinataire(rdv);
  await require('../services/emailService').send({
    to: destinataire.email,
    subject: 'Notification de rendez-vous',
    text: this.contenu
  });
};

// Méthode privée pour le SMS
notificationSchema.methods._envoyerSMS = async function(rdv) {
  const destinataire = this._getDestinataire(rdv);
  await require('../services/smsService').send(
    destinataire.telephone,
    this.contenu
  );
};

// Détecte automatiquement le destinataire (Patient ou Médecin)
notificationSchema.methods._getDestinataire = function(rdv) {
  // Priorité au patient si le contenu le suggère
  if (this.contenu.includes('patient') || this.contenu.includes('Patient')) {
    return rdv.patient;
  }
  return rdv.medecin; // Par défaut
};

// ======================================================
// HOOKS (DÉCLENCHEURS AUTOMATIQUES)
// ======================================================

// Auto-population à la récupération
notificationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'rendezVous',
    select: 'date heure statut',
    populate: [
      { path: 'patient', select: 'nom prenom email telephone' },
      { path: 'medecin', select: 'nom prenom email telephone' }
    ]
  });
  next();
});

// Index pour optimisation
notificationSchema.index({ rendezVous: 1, statut: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;