import { RegisterPayload } from "@/lib/types";
import { sql } from "@vercel/postgres";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password }: RegisterPayload = await request.json();
    if (!email || !password) {
      return NextResponse.json({ message: "error" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const response =
      await sql`INSERT INTO users (provider, email, password) VALUES ('local', ${email}, ${hashedPassword})`;
  } catch (e) {
    console.log({ e });
    return NextResponse.json({ message: "error" }, { status: 500 });
  }

  return NextResponse.json({ message: "success" });
}
