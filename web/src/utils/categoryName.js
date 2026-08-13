export function categoryName(category, lang) {
  if (!category) return '';
  if (lang === 'ar') return category.nameAr;
  if (lang === 'tr') return category.nameTr || category.nameEn;
  return category.nameEn;
}
