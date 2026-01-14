import { NextResponse } from "next/server";
import { getUsers , createUser, getUserByUsername } from "@/lib/services/user.service";
import { logger } from "@/lib/logger";
import { User } from "@/lib/models/users/user.model";

/**
 * GET Users
 * @param request 
 * @param param1 pass username as param 
 * @returns selected user
 */
export async function GET(request: Request, { params }: { params: { username?: string } }): Promise<NextResponse<User | null> | NextResponse<User[]> | undefined> {
  try {
    if (params.username) {
      const user = await getUserByUsername(params.username);
      return NextResponse.json(user);
    }
    const users = await getUsers();
    return NextResponse.json(users);
  } catch(e) {
    logger.info(e);
    return;
  }
}
/**
 * POST User
 * @param request user data
 * @returns created user
 */
export async function POST(request: Request): Promise<NextResponse<User | null>> {
  const { username, email, role } = await request.json();
  const newUser = await createUser(username, email, role);
  return NextResponse.json(newUser);
}

/**
 * DELETE User
 * @param request user_id to detele
 * @returns deleted row user
 */
export async function DELETE(request: Request) {
  
}