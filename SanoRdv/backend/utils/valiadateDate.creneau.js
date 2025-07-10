export function validerDate(date) {
    const isValidDate = !isNaN(new Date(date).getTime());
    return isValidDate;
}