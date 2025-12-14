import pool from './db';

export async function getApartmentOffers(apartmentId) {
    try {
        const [offers] = await pool.query(`
      SELECT * FROM offers 
      WHERE is_active = TRUE 
        AND valid_from <= CURDATE() 
        AND valid_until >= CURDATE()
        AND (
          apartment_ids IS NULL 
          OR JSON_CONTAINS(apartment_ids, ?)
        )
      ORDER BY discount_percentage DESC
    `, [JSON.stringify(apartmentId)]);

        return offers;
    } catch (error) {
        console.error('Error fetching apartment offers:', error);
        return [];
    }
}

export async function calculateDiscountedPrice(originalPrice, offers) {
    if (!offers || offers.length === 0) return originalPrice;

    // Use the best offer (highest discount)
    const bestOffer = offers[0];
    const discountAmount = originalPrice * (bestOffer.discount_percentage / 100);

    return originalPrice - discountAmount;
}