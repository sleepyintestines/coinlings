export function getSprite(rarity){
    const spriteOptions = {
        common: [
            "/sprites/coinling-sprites/common/common.png",
        ],
        rare: [
            "/sprites/coinling-sprites/rare/rare.png",
            "/sprites/coinling-sprites/rare/rare2.png",
            "/sprites/coinling-sprites/rare/rare3.png",
            "/sprites/coinling-sprites/rare/rare4.png",
            "/sprites/coinling-sprites/rare/rare5.png",
            "/sprites/coinling-sprites/rare/rare6.png",
            "/sprites/coinling-sprites/rare/rare7.png",
            "/sprites/coinling-sprites/rare/rare8.png",
            "/sprites/coinling-sprites/rare/rare9.png",
            "/sprites/coinling-sprites/rare/rare10.png",
            "/sprites/coinling-sprites/rare/rare11.png",
        ],
        legendary: [
            "/sprites/coinling-sprites/legendary/legendary.png",
        ]
    };

    const options = spriteOptions[rarity];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
}