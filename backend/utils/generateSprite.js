export function getSprite(rarity){
    const spriteOptions = {
        common: [
            "/sprites/common/common.png",
        ],
        rare: [
            "/sprites/rare/rare.png",
            "/sprites/rare/rare2.png",
            "/sprites/rare/rare3.png",
            "/sprites/rare/rare4.png",
            "/sprites/rare/rare5.png",
        ],
        legendary: [
            "/sprites/legendary/legendary.png",
        ]
    };

    const options = spriteOptions[rarity];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
}