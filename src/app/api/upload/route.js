import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// POST /api/upload — handle file uploads
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'general';

        if (!file) {
            return NextResponse.json({ error: 'ไม่พบไฟล์' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'รองรับเฉพาะไฟล์ภาพ (JPG, PNG, WebP, GIF)' }, { status: 400 });
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'ไฟล์ต้องมีขนาดไม่เกิน 5MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Generate unique filename
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        const url = `/uploads/${folder}/${filename}`;

        return NextResponse.json({ url, filename });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'อัปโหลดไฟล์ล้มเหลว' }, { status: 500 });
    }
}
