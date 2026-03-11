const FIRST_NAMES = [
  "Tae-in","Joo-won","Sang-woo","Ki-jun","Won-bin","Hee-jun","Dong-wook","Yong-hwa","Tae-min","Hyun-bin",
  "Du-jun","Chang-min","Young-min","Il-woo","Tae-joon","Kyung-hoon","Ji-won","Dong-jun","Sun-jae","Gi-kwang",
  "Byeong-kwan","Jae-won","Bum-joon","Chan-yeol","Kyung-soo","Baek-hyun","Yong-jun","Sung-kyu","Ki-bum","Min-ho",
  "Jong-hyun","Kwang-hee","Sung-jin","Dong-hae","Jung-min","Gi-hyun","Yoon-sung","Soo-hyun","Tae-oh","Won-hyuk",
  "Joon-young","In-ho","Kyung-jae","Bo-min","Sung-hoon","Hyun-sik","Tae-woong","Jin-young","Sang-il","Dae-sung",
  "So-hee","Ha-jung","Hye-jin","Ji-yeon","So-jin","Hye-ran","Min-ah","Ye-jin","Ji-na","Soo-jin",
  "Ha-yoon","Mi-soo","Ye-na","Ga-in","Mi-yeon","Ji-yoo","Chae-won","Hyo-rin","So-ra","Sun-hee",
  "Na-young","So-mi","Yoo-jung","Chae-rin","Hyun-ah","Su-yeon","Ye-bi","Bo-young","Hyo-yeon","Seung-yeon",
  "Mi-nju","Ga-young","Chae-yoon","Ye-seo","Ha-rin","Da-in","So-won","A-reum","Da-sol","Mi-hyun",
  "Ah-young","Si-yeon","Hee-young","Ha-na","Ha-eun","Yu-jin","Ji-hyun","Ye-won","Chae-yeon","Na-rae",
] as const;

const LAST_NAMES = [
  "Kim","Lee","Park","Choi","Jung","Kang","Cho","Yoon","Jang","Lim",
  "Han","Oh","Seo","Shin","Kwon","Hwang","Ahn","Song","Ryu","Hong",
  "Jeon","Ko","Moon","Yang","Bae","Baek","Heo","Nam","Sim","No",
  "Ha","Gwak","Cha","Joo","Woo","Min","Yu","Jin","Byeon","Do",
  "Seok","Gil","Ma","Tak","Yeom","Eom","So","Won","Geum","Wi",
  "Sa","Seol","Goo","Myung","Eun","Cheon","Pan","Ro","Gong","Chang",
  "Kye","Pyo","Namgung","Jegal","Yeon","Bang","Maeng","Bin","Bok","Bong",
  "Je","Jong","Mok","Pil","Ong","Tae","Chi","Dal","Eo","Gam",
  "Ik","Il","Ip","Nae","Nak","Paeng","Seung","Yim","Ri","Gal",
  "Cheong","Gyeong","Ye","Mu","Nang","Maek","Rang","Gap","Yak","Mak",
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function generateAlias(): string {
  const fname = pick(FIRST_NAMES).toLowerCase().replace(/-/g, "");
  const lname = pick(LAST_NAMES).toLowerCase().replace(/-/g, "");
  const suffix = Math.floor(Math.random() * (99999 - 100 + 1)) + 100;
  const style = Math.random() < 0.5 ? "underscore" : "concat";
  return style === "underscore"
    ? `${fname}_${lname}${suffix}`
    : `${fname}${lname}${suffix}`;
}

export function generateFullName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
