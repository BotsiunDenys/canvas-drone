import { httpApi } from "../axios";

export class UserService {
  static async initUser({ name, complexity }) {
    const res = await httpApi.post("init", { name, complexity });
    return res;
  }

  static async getUserChunks(id, chunkNo) {
    const res = await httpApi.get(`token/${chunkNo}?id=${id}`);
    return res;
  }
}
