export interface MockLetter {
  fa: string;
  name: string;
  translit: string;
  sound: string;
}

export const MOCK_LETTERS: MockLetter[] = [
  { fa: "ا", name: "alef", translit: "â / a", sound: "as in “father”" },
  { fa: "ب", name: "be", translit: "b", sound: "as in “bia”" },
  { fa: "پ", name: "pe", translit: "p", sound: "as in “pen”" },
  { fa: "خ", name: "khe", translit: "kh", sound: "like Scottish “loch”" },
];
