import "reflect-metadata";
import { DATA_SOURCE } from "../Config/data-source";
import * as rand from "random-key";
import { Privilege } from "../Models/Entities/Privilege";
import { Repository } from "typeorm";

export async function createPrivilegeKey(numberOfKeys: number) {
  const PRIVILEGE_REPO: Repository<Privilege> = DATA_SOURCE.getRepository(Privilege);
  let newPrivileges: Privilege[] = Array.from({ length: numberOfKeys }, function () {
    return PRIVILEGE_REPO.create({
      PrivilegeKey: rand.generate(24),
    });
  });
  console.log(await PRIVILEGE_REPO.save(newPrivileges));
}

export async function deletePrivilegeKey(inputKey: string) {
  const PRIVILEGE_REPO: Repository<Privilege> = DATA_SOURCE.getRepository(Privilege);

  await PRIVILEGE_REPO.delete({
    PrivilegeKey: inputKey,
  });
  console.log(`---Deleted Privilege Key: ${inputKey} ---`);
}

export async function showAllPrivilegeKeys() {
  const PRIVILEGE_REPO: Repository<Privilege> = DATA_SOURCE.getRepository(Privilege);
  let all: Privilege[] = await PRIVILEGE_REPO.find();
  console.log(all);
}

export async function hasPrivilege(inputKey: string) {
  const PRIVILEGE_REPO: Repository<Privilege> = DATA_SOURCE.getRepository(Privilege);
  return await PRIVILEGE_REPO.exists({
    where: {
      PrivilegeKey: inputKey,
    },
  });
}
