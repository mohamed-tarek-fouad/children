export type Baby = {
  babyName: string;
  gender: Gender;
  birthDate: Date;
  weight?: number;
};
enum Gender {
  boy,
  girl,
}
