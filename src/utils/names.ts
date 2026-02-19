const FIRST_NAMES = [
  "Hae-in","Min-jun","Ji-woo","Seo-yeon","Do-yoon","Ji-ho","Ha-joon","Seo-jun","Ji-hu","Eun-woo",
  "Ye-jun","Si-woo","Joon-ho","Hyun-woo","Jun-seo","Yoo-jun","Dong-hyun","Jae-yoon","Seung-hyun","Woo-jin",
  "Jin-woo","Gun-woo","Min-jae","Seung-woo","Hyun-jun","Ji-hoon","Tae-yang","Hyeon-su","Sung-min","Yoon-ho",
  "Jae-min","Kyung-min","Chan-woo","Sang-hoon","Jung-ho","Dae-hyun","Kang-min","Byung-ho","Seok-jin","Taek-jun",
  "Bo-gum","Jong-in","Young-jae","Hwan","Kyu-hyun","Si-hyun","Jae-hyun","Tae-hyun","Eun-ho","Min-kyu",
  "Seo-hyun","Ji-min","Soo-bin","Ye-eun","Hye-in","Eun-ji","Chaeyoung","Yuna","Nari","Jisoo",
  "Seulgi","Wendy","Irene","Joy","Yeri","Hani","Solar","Moonbyul","Hwasa","Sejeong",
  "Nayeon","Jeongyeon","Momo","Sana","Mina","Dahyun","Chaeyoung","Tzuyu","Karina","Winter",
  "Giselle","Ningning","Soo-yeon","Hye-ri","Bo-ra","Na-eun","Ji-eun","So-young","Yu-ri","Min-seo",
  "Da-eun","Hae-won","Ji-ah","Ara","Su-ah","Ye-rim","Eun-seo","Ga-eun","Hyo-jin","Mi-rae",
] as const;

const LAST_NAMES = [
  "Kim","Lee","Park","Choi","Jung","Kang","Cho","Yoon","Jang","Lim",
  "Han","Oh","Seo","Shin","Kwon","Hwang","Ahn","Song","Ryu","Hong",
  "Jeon","Ko","Moon","Yang","Bae","Baek","Heo","Nam","Sim","No",
  "Jeong","Ha","Gwak","Sung","Cha","Joo","Woo","Min","Yu","Jin",
  "Byeon","Do","Seok","Sun","An","Gil","Yeo","Pi","Ma","Na",
  "Tak","Yeom","Eom","So","Hyeon","Ok","Won","Seon","Geum","Wi",
  "Sa","Ju","Hahm","Huh","Jang","Beom","Mo","Dong","Seol","Goo",
  "Myung","Ki","Eun","Dang","Jegal","Sagong","Namgung","Seomun","Mangjeol","Cheon",
  "Pan","Hyeok","Jae","Seong","Guk","Ro","Byeol","Gong","Chang","Sak",
  "U","Kye","Deok","Hye","Suk","In","Yeon","Hyeok","Gwan","Pyo",
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
