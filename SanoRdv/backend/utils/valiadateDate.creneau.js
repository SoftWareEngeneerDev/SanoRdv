export function validerDate(date) {
   // 1. Vérification basique
    if (!date) return false;
    
    // 2. Conversion en Date
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return false;
    
    // 3. Validation du format si c'est une string
    if (typeof date === 'string') {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(date)) return false;
    }
    
    // 4. Optionnel : vérification date future
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Comparaison sans l'heure
    return dateObj >= currentDate;
}
