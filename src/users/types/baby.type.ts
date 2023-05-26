export type Baby = {
  babyName: string;
  gender: Gender;
  birthDate: Date;
  Weight?: number;
};
enum Gender {
  boy,
  girl,
}
