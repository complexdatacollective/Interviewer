import { isElectron } from "@utils/Environment";

export default function getApi() {
  if (isElectron()) {
    return import("./electronApi");
  }

  return import("./webApi");
}