import { User } from "@/lib/models/users/user.model";

export async function getUsers() {
  return User.findAll();
}

export async function createUser(name: string, email: string) {
  return User.create({ name, email });
}