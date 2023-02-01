import * as http from "http";

function isHostUp(url: string): Promise<boolean> {
  return new Promise(resolve => {
    http.get(url, () => { resolve(true) })
    .on("error", () => resolve(false));
  });
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export async function waitForServerUp(url: string) {
  console.log("local server: waiting");
  while (true) {
    const isUp = await isHostUp(url);
    if (isUp) break;
    await wait(1000);
  }
  console.log("local server: up");
}
