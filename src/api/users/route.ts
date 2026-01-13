import { NextResponse } from "next/server";
import { getUsers , createUser, getUserByUsername } from "@/lib/services/user.service";

export async function GET(request: Request, { params }: { params: { username?: string } }) {
  if (params.username) {
    const user = await getUserByUsername(params.username);
    return NextResponse.json(user);
  }
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const { username, email, role } = await request.json();
  const newUser = await createUser(username, email, role);
  return NextResponse.json(newUser);
}