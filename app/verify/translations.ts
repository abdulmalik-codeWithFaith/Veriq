/*
  NOTE: Have a native speaker of each language review these texts before launch,
  especially Yoruba, Hausa and Igbo. Wording on a verification result matters.
  Use {count} where the number of earlier checks should appear.
*/

export type Lang = "en" | "fr" | "yo" | "ha" | "ig";

export const languages: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
];

export type Strings = {
  pageTitle: string;
  intro: string;
  language: string;
  codeLabel: string;
  placeholder: string;
  verify: string;
  verifying: string;
  emptyError: string;
  genuineTitle: string;
  genuineBody: string;
  repeatTitle: string;
  repeatBody: string;
  invalidTitle: string;
  invalidBody: string;
  errorTitle: string;
  errorBody: string;
  limitTitle: string;
  limitBody: string;
  manufacturer: string;
  product: string;
  details: string;
  checkAnother: string;
};

export const translations: Record<Lang, Strings> = {
  en: {
    pageTitle: "Check if your product is genuine",
    intro: "Enter the code on your product, or scan its QR code with your phone camera.",
    language: "Language",
    codeLabel: "Product code",
    placeholder: "For example, VR8K29PX",
    verify: "Verify",
    verifying: "Checking",
    emptyError: "Enter the code printed on your product.",
    genuineTitle: "Genuine product",
    genuineBody: "This code is registered by the manufacturer below.",
    repeatTitle: "Checked before. Be careful.",
    repeatBody:
      "This code has been verified {count} times. If you did not check it before, the product may be a copy. Do not trust it until you confirm with the manufacturer.",
    invalidTitle: "Code not recognised",
    invalidBody: "Check the characters and try again. If the code is correct, do not trust this product.",
    errorTitle: "Something went wrong",
    errorBody: "We couldn’t check this code. Check your connection and try again.",
    limitTitle: "Too many attempts",
    limitBody: "Please wait a few minutes and try again.",
    manufacturer: "Manufacturer",
    product: "Product",
    details: "Product information",
    checkAnother: "Check another code",
  },
  fr: {
    pageTitle: "Vérifiez que votre produit est authentique",
    intro: "Saisissez le code figurant sur votre produit, ou scannez son QR code avec l’appareil photo de votre téléphone.",
    language: "Langue",
    codeLabel: "Code du produit",
    placeholder: "Par exemple, VR8K29PX",
    verify: "Vérifier",
    verifying: "Vérification en cours",
    emptyError: "Saisissez le code imprimé sur votre produit.",
    genuineTitle: "Produit authentique",
    genuineBody: "Ce code est enregistré par le fabricant indiqué ci-dessous.",
    repeatTitle: "Déjà vérifié. Soyez prudent.",
    repeatBody:
      "Ce code a été vérifié {count} fois. Si vous ne l’avez pas vérifié auparavant, le produit est peut-être une contrefaçon. Ne lui faites pas confiance avant d’avoir contacté le fabricant.",
    invalidTitle: "Code non reconnu",
    invalidBody: "Vérifiez les caractères et réessayez. Si le code est correct, ne faites pas confiance à ce produit.",
    errorTitle: "Un problème est survenu",
    errorBody: "Nous n’avons pas pu vérifier ce code. Vérifiez votre connexion et réessayez.",
    limitTitle: "Trop de tentatives",
    limitBody: "Veuillez patienter quelques minutes, puis réessayer.",
    manufacturer: "Fabricant",
    product: "Produit",
    details: "Informations sur le produit",
    checkAnother: "Vérifier un autre code",
  },
  yo: {
    pageTitle: "Ṣàyẹ̀wò bóyá ọjà rẹ jẹ́ ojúlówó",
    intro: "Tẹ kóòdù tó wà lórí ọjà rẹ, tàbí ṣe àyẹ̀wò QR kóòdù rẹ̀ pẹ̀lú kámẹ́rà fóònù rẹ.",
    language: "Èdè",
    codeLabel: "Kóòdù ọjà",
    placeholder: "Fún àpẹẹrẹ, VR8K29PX",
    verify: "Ṣàyẹ̀wò",
    verifying: "Ń ṣàyẹ̀wò",
    emptyError: "Tẹ kóòdù tí a tẹ̀ sórí ọjà rẹ.",
    genuineTitle: "Ojúlówó ọjà",
    genuineBody: "Olùpèsè tí a kọ sísàlẹ̀ ni ó forúkọ kóòdù yìí sílẹ̀.",
    repeatTitle: "A ti ṣàyẹ̀wò rẹ̀ rí. Ṣọ́ra.",
    repeatBody:
      "A ti ṣàyẹ̀wò kóòdù yìí ní ìgbà {count}. Tí kì í bá ṣe ìwọ ni o ṣàyẹ̀wò rẹ̀ tẹ́lẹ̀, ọjà náà lè jẹ́ èyí tí a ṣe àfarawé. Má ṣe gbẹ́kẹ̀lé e títí o fi bá olùpèsè sọ̀rọ̀.",
    invalidTitle: "A kò dá kóòdù yìí mọ̀",
    invalidBody: "Ṣàyẹ̀wò àwọn ọ̀rọ̀ àti nọ́ńbà náà, kí o tún gbìyànjú. Tí kóòdù náà bá tọ́, má ṣe gbẹ́kẹ̀lé ọjà yìí.",
    errorTitle: "Nǹkan kan ṣẹlẹ̀",
    errorBody: "A kò lè ṣàyẹ̀wò kóòdù yìí. Ṣàyẹ̀wò ìkànnì rẹ kí o tún gbìyànjú.",
    limitTitle: "Ìgbìyànjú ti pọ̀ jù",
    limitBody: "Jọ̀wọ́ dúró fún ìṣẹ́jú díẹ̀, kí o tún gbìyànjú.",
    manufacturer: "Olùpèsè",
    product: "Ọjà",
    details: "Àlàyé nípa ọjà",
    checkAnother: "Ṣàyẹ̀wò kóòdù mìíràn",
  },
  ha: {
    pageTitle: "Duba ko samfurinka na asali ne",
    intro: "Shigar da lambar da ke jikin samfurinka, ko ka duba lambar QR ɗinsa da kyamarar wayarka.",
    language: "Harshe",
    codeLabel: "Lambar samfur",
    placeholder: "Misali, VR8K29PX",
    verify: "Tabbatar",
    verifying: "Ana dubawa",
    emptyError: "Shigar da lambar da aka buga a jikin samfurinka.",
    genuineTitle: "Samfur na asali",
    genuineBody: "Mai ƙera da aka nuna a ƙasa ne ya yi rajistar wannan lambar.",
    repeatTitle: "An riga an duba ta. Ka yi hankali.",
    repeatBody:
      "An tabbatar da wannan lambar sau {count}. Idan ba kai ne ka duba ta a baya ba, samfurin yana iya zama na jabu. Kada ka amince da shi har sai ka tabbatar da mai ƙera.",
    invalidTitle: "Ba a gane lambar ba",
    invalidBody: "Duba haruffan da lambobin, ka sake gwadawa. Idan lambar daidai ce, kada ka amince da wannan samfurin.",
    errorTitle: "Wani abu ya faru",
    errorBody: "Ba mu iya duba wannan lambar ba. Duba haɗin intanet ɗinka, ka sake gwadawa.",
    limitTitle: "An yi yunƙuri da yawa",
    limitBody: "Da fatan za ka jira na ɗan mintuna, sannan ka sake gwadawa.",
    manufacturer: "Mai ƙera",
    product: "Samfur",
    details: "Bayanin samfur",
    checkAnother: "Duba wata lamba",
  },
  ig: {
    pageTitle: "Lelee ma ngwaahịa gị bụ nke ezi",
    intro: "Tinye koodu dị n’ahụ ngwaahịa gị, ma ọ bụ nyochaa koodu QR ya site na igwefoto ekwentị gị.",
    language: "Asụsụ",
    codeLabel: "Koodu ngwaahịa",
    placeholder: "Dịka ọmụmaatụ, VR8K29PX",
    verify: "Nyochaa",
    verifying: "Na-enyocha",
    emptyError: "Tinye koodu e biri n’ahụ ngwaahịa gị.",
    genuineTitle: "Ngwaahịa ezi",
    genuineBody: "Onye na-emepụta ya ka e depụtara n’okpuru debara koodu a.",
    repeatTitle: "E nyochaala ya. Lezie anya.",
    repeatBody:
      "E nyochala koodu a ugboro {count}. Ọ bụrụ na ọ bụghị gị nyochara ya na mbụ, ngwaahịa a nwere ike ịbụ mkpụrụ. Ekwela ya ntụkwasị obi ruo mgbe ị kpọtụrụ onye na-emepụta ya.",
    invalidTitle: "Amaghị koodu a",
    invalidBody: "Lelee mkpụrụedemede na ọnụọgụ ndị ahụ, nwaa ọzọ. Ọ bụrụ na koodu ahụ ziri ezi, ekwela ngwaahịa a ntụkwasị obi.",
    errorTitle: "Ihe mere",
    errorBody: "Anyị enweghị ike ịnyocha koodu a. Lelee njikọ ịntanetị gị, nwaa ọzọ.",
    limitTitle: "Ọtụtụ mbọ ka e mere",
    limitBody: "Biko chere nkeji ole na ole, nwaa ọzọ.",
    manufacturer: "Onye na-emepụta ya",
    product: "Ngwaahịa",
    details: "Ozi banyere ngwaahịa",
    checkAnother: "Nyochaa koodu ọzọ",
  },
};