import { Users } from "@/lib/models/users/user.model";

export async function getUsers() {
  return Users.findAll();
}

export async function getUserByUsername(username: string) {
  return Users.findOne({ where: { username } });
}

export async function createUser(username: string, email: string, role: string) {
  return Users.create({ username, email, role });
}