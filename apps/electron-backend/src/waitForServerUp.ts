import * as http from "http";

function isHostUp(url: string): Promise<boolean> {
  console.log('isHostUp', url);
  return new Promise(resolve => {
    http.get(url, () => { resolve(true) })
      .on("error", (e) => {
        console.log(e);
        resolve(false)
      });
  });
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export async function waitForServerUp(url: string) {
  console.log("local server: waiting", url);
  while (true) {
    const isUp = await isHostUp(url);
    if (isUp) break;
    await wait(1000);
  }
  console.log("local server: up");
}
