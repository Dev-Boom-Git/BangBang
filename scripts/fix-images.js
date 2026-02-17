// Quick script to update product/settings images to Unsplash URLs
// Run with: node scripts/fix-images.js

import mysql from 'mysql2/promise';

async function fixImages() {
    const conn = await mysql.createConnection({
        host: 'localhost', port: 3306, user: 'root', password: '', database: 'bangbang',
    });

    console.log('🖼️  Updating product images...');

    const imageMap = {
        'Shokupan': 'https://images.unsplash.com/photo-1586444248879-bc604cbd555a?w=600&q=80',
        'Anpan': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80',
        'Melon Pan': 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&q=80',
        'Curry Bread': 'https://images.unsplash.com/photo-1549931319-a545753467c8?w=600&q=80',
        'Ham & Cheese': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
        'Butter Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&q=80',
        'Chocolate Croissant': 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=600&q=80',
        'Cream Danish': 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&q=80',
        'Strawberry Cake': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',
        'Matcha Roll': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    };

    for (const [name, url] of Object.entries(imageMap)) {
        await conn.query('UPDATE products SET image = ? WHERE name = ?', [url, name]);
    }

    console.log('🏠 Updating hero image...');
    await conn.query(
        "UPDATE settings SET setting_value = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1920&q=80' WHERE setting_key = 'hero_image'"
    );

    console.log('✅ All images updated!');
    await conn.end();
}

fixImages().catch(err => { console.error('❌ Error:', err); process.exit(1); });
