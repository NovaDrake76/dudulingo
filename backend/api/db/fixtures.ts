export const users = [
  {
    name: 'José Eduardo',
    providerId: 'github|12345',
    photoUrl: 'https://example.com/jose.png',
  },
  {
    name: 'Alice Smith',
    providerId: 'google|67890',
    photoUrl: 'https://example.com/alice.png',
  },
]

export const decks = [
  {
    name: 'Animais',
    description: 'Uma coleção de animais comuns em inglês.',
  },
  {
    name: '40 Palavras Mais Comuns',
    description: 'As 40 palavras mais utilizadas na língua inglesa.',
  },
]

// Lista de palavras mais comuns
const commonWords = [
  { answer: 'the', prompt: 'o, a, os, as' },
  { answer: 'be', prompt: 'ser, estar' },
  { answer: 'to', prompt: 'para, a' },
  { answer: 'of', prompt: 'de' },
  { answer: 'and', prompt: 'e' },
  { answer: 'a', prompt: 'um, uma' },
  { answer: 'in', prompt: 'em, no, na' },
  { answer: 'that', prompt: 'aquele, essa, isso, que' },
  { answer: 'have', prompt: 'ter' },
  { answer: 'I', prompt: 'eu' },
  { answer: 'it', prompt: 'isto, isso' },
  { answer: 'for', prompt: 'para, por' },
  { answer: 'not', prompt: 'não' },
  { answer: 'on', prompt: 'em, sobre' },
  { answer: 'with', prompt: 'com' },
  { answer: 'he', prompt: 'ele' },
  { answer: 'as', prompt: 'como, enquanto' },
  { answer: 'you', prompt: 'você' },
  { answer: 'do', prompt: 'fazer' },
  { answer: 'at', prompt: 'em, a, às' },
  { answer: 'this', prompt: 'este, esta, isto' },
  { answer: 'but', prompt: 'mas, porém' },
  { answer: 'his', prompt: 'dele' },
  { answer: 'by', prompt: 'por, perto de' },
  { answer: 'from', prompt: 'de, desde' },
  { answer: 'they', prompt: 'eles, elas' },
  { answer: 'we', prompt: 'nós' },
  { answer: 'say', prompt: 'dizer' },
  { answer: 'her', prompt: 'dela' },
  { answer: 'she', prompt: 'ela' },
  { answer: 'or', prompt: 'ou' },
  { answer: 'an', prompt: 'um, uma' },
  { answer: 'will', prompt: '(futuro)' },
  { answer: 'my', prompt: 'meu, minha' },
  { answer: 'one', prompt: 'um, uma (número)' },
  { answer: 'all', prompt: 'todo, toda, todos, todas' },
  { answer: 'would', prompt: '(condicional)' },
  { answer: 'there', prompt: 'lá, ali' },
  { answer: 'their', prompt: 'deles, delas' },
  { answer: 'what', prompt: 'o que, qual' },
]

// Mapeia as palavras comuns para o formato de card
const commonWordCards = commonWords.map((word) => ({
  type: 'basic' as const,
  level: 1,
  prompt: word.prompt,
  answer: word.answer,
  lang: 'pt-BR',
  // imageUrl não é necessário para palavras comuns
}))

export const cards = [
  // Cards de Animais (existentes)
  {
    type: 'basic',
    level: 1,
    prompt: 'Cachorro',
    answer: 'Dog',
    lang: 'pt-BR',
    imageUrl:
      'https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=0.752xw:1.00xh;0.175xw,0&resize=1200:*',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Gato',
    answer: 'Cat',
    lang: 'pt-BR',
    imageUrl:
      'https://t3.ftcdn.net/jpg/02/36/99/22/360_F_236992283_sNOxCVQeFLd5pdqaKGh8DRGMZy7P4XKm.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Leão',
    answer: 'Lion',
    lang: 'pt-BR',
    imageUrl:
      'https://www.bornfree.org.uk/wp-content/uploads/2023/09/Web-image-iStock-492611032.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Tigre',
    answer: 'Tiger',
    lang: 'pt-BR',
    imageUrl:
      'https://files.worldwildlife.org/wwfcmsprod/images/Tiger_resting_Bandhavgarh_National_Park_India/hero_small/6aofsvaglm_Medium_WW226365.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Elefante',
    answer: 'Elephant',
    lang: 'pt-BR',
    imageUrl: 'https://a-z-animals.com/media/2022/09/shutterstock_2118427715-1024x711.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Macaco',
    answer: 'Monkey',
    lang: 'pt-BR',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/4/43/Bonnet_macaque_%28Macaca_radiata%29_Photograph_By_Shantanu_Kuveskar.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Girafa',
    answer: 'Giraffe',
    lang: 'pt-BR',
    imageUrl:
      'https://giraffeconservation.org/wp-content/uploads/2024/11/featured-16-9_southern-3-topaz.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Zebra',
    answer: 'Zebra',
    lang: 'pt-BR',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Zebra_standing_alone_crop.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Urso',
    answer: 'Bear',
    lang: 'pt-BR',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/Ours_brun_parcanimalierpyrenees_1.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Pássaro',
    answer: 'Bird',
    lang: 'pt-BR',
    imageUrl:
      'https://www.nwf.org/-/media/NEW-WEBSITE/Shared-Folder/Magazines/2024/Spring/GALBATROSS-Eastern-bluebirds-SPRING24-960x630.jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Peixe',
    answer: 'Fish',
    lang: 'pt-BR',
    imageUrl:
      'https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?cs=srgb&dl=pexels-crisdip-35358-128756.jpg&fm=jpg',
  },
  {
    type: 'basic',
    level: 1,
    prompt: 'Cavalo',
    answer: 'Horse',
    lang: 'pt-BR',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Nokota_Horses_cropped.jpg',
  },
  ...commonWordCards,
]
