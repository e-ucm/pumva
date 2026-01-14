import { User } from "@/lib/models/users/user.model";

export async function getUsers() {
  return User.findAll();
}

export async function getUserByUsername(username: string) {
  return User.findOne({ where: { username } });
}

export async function createUser(username: string, email: string, role: string) {
  return User.create({ username, email, role });
}