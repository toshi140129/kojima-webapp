export type Racer = {
  name: string;
  grade: string;
  zenkokuWin: string;
  zenkoku2: string;
  touchiWin: string;
  kosetsu: string;
  motor2: string;
  boat2: string;
  exTime: string;
  exST: string;
  fNum: string;
  lNum: string;
};

export type Race = {
  date: string;
  weekday: string;
  rno: number;
  p1: string;
  p2: string;
  p3: string;
  pay: string;
  ninki: string;
  wind: string;
  windDir: string;
  wave: string;
  temp: string;
  waterTemp: string;
  waterQuality: string;
  tide: string;
  racers: Racer[];
};
