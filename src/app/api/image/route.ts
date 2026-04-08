import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const imagesDir = path.join(process.cwd(), "public", "images");

  try {
    const files = fs
      .readdirSync(imagesDir)
      .filter((f) => /\.(jpg|jpeg|png|webp|avif)$/i.test(f));

    if (files.length === 0) {
      return NextResponse.json({ error: "No images" }, { status: 404 });
    }

    const random = files[Math.floor(Math.random() * files.length)];
    return NextResponse.redirect(new URL(`/images/${random}`, process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"));
  } catch {
    return NextResponse.json({ error: "No images folder" }, { status: 404 });
  }
}
