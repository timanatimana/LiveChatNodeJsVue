const generateDiceBearBottts = (seed: number) => `https://avatars.dicebear.com/api/bottts/${seed}.svg`;

const generateDiceBearGridy = (seed: number) => `https://avatars.dicebear.com/api/gridy/${seed}.svg`;

export const fetchDiceBearAvatar = (style: string, seed: number) =>
    `https://avatars.dicebear.com/api/${style}/${seed}.svg`;

export const fetchDefaultDiceBearAvatar = () => `https://avatars.dicebear.com/api/identicon/0.svg`;

export interface RandomAvatar {
    style: string;
    seed: number;
    uri: string;
}

export type RandomAvatars = RandomAvatar[];

export const generateAvatars = () => {
    const data: RandomAvatars = [];

    for (let i = 0; i < 5; i++) {
        const seed = Math.random();
        const res = generateDiceBearBottts(seed);
        data.push({ style: "bottts", seed: seed, uri: res });
    }
    for (let i = 0; i < 4; i++) {
        const seed = Math.random();
        const res = generateDiceBearGridy(seed);
        data.push({ style: "gridy", seed: seed, uri: res });
    }
    return data;
};
