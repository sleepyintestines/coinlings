export const personalityDialogues = {
    cheerful: [
        "What a wonderful day!",
        "Hey there, buddy! Got any spare change?",
        "I love meeting new people!",
        "Coins shine brighter when shared!",
        "Isn't everything just great today?",
        "Oh wow, a visitor!",
        "Every coin has a happy story!",
        "I could bounce all day!",
        "You make this place feel warmer!",
        "I found a coin earlier—best day ever!",
        "Life’s better with jingling pockets!",
        "Want to count coins together?",
        "I believe today will be lucky!",
        "Smiles are free, just like this greeting!",
        "Coins love being collected!",
        "Hi hi hi!",
        "Adventure awaits us!",
        "Even small coins matter!",
        "I’m glad you stopped by!",
        "Let’s make today amazing!"
    ],

    grumpy: [
        "Hmph. Don't bother me.",
        "Back off. I'm busy counting coins.",
        "You again? Fine.",
        "Coins don’t count themselves.",
        "I was having a quiet moment.",
        "Watch where you step.",
        "These coins won’t guard themselves.",
        "Do you need something?",
        "I don’t like surprises.",
        "You're blocking my light.",
        "This place was calmer before.",
        "Tch. Kids these days.",
        "Don’t touch my stash.",
        "I work better alone.",
        "Make it quick.",
        "I knew today would be annoying.",
        "At least the coins behave.",
        "Why is everyone so loud?",
        "Go on, then.",
        "Hmph… fine, stay."
    ],

    mysterious: [
        "The moon told me secrets last night...",
        "Not everything is as it seems.",
        "Are you listening closely?",
        "Coins whisper if you’re patient.",
        "Time moves strangely here.",
        "I’ve seen this moment before.",
        "Shadows collect more than dust.",
        "Every coin has two faces.",
        "Silence speaks louder than gold.",
        "Do you feel it watching?",
        "Fate jingles softly.",
        "The walls remember.",
        "Nothing here is accidental.",
        "Dreams leave traces.",
        "You arrived exactly when foretold.",
        "Some paths loop forever.",
        "Coins can unlock more than doors.",
        "Listen… it’s closer now.",
        "Truth hides in plain sight.",
        "We will meet again—somewhen."
    ],

    shy: [
        "Oh—hello.",
        "Um... do you like collecting coins too?",
        "I don't talk much, but... hi.",
        "S-sorry, I was just standing here.",
        "I didn’t expect company.",
        "Coins are… comforting.",
        "I hope I’m not in the way.",
        "You seem nice.",
        "I usually keep to myself.",
        "Oh! You startled me.",
        "I like quiet places.",
        "Sometimes coins listen better than people.",
        "Th-thank you for stopping by.",
        "I don’t get visitors often.",
        "It’s okay if you don’t stay.",
        "I’ll just be here.",
        "I found this coin earlier…",
        "Talking is hard sometimes.",
        "I hope you’re having a good day.",
        "Um… goodbye."
    ],

    greedy: [
        "Got coins? I love coins.",
        "Every coin here is mine. Probably.",
        "Shiny. I like shiny.",
        "You wouldn’t steal from me… right?",
        "I can hear coins clinking already.",
        "More coins, more happiness.",
        "That one looks especially valuable.",
        "I count my coins daily. Hourly.",
        "Sharing? Hmm… maybe later.",
        "Coins are meant to be gathered.",
        "I could use just one more.",
        "Don’t touch that—it’s mine!",
        "I know exactly how many I have.",
        "Coins feel safer in big piles.",
        "I never forget a missing coin.",
        "If I stare long enough, more appear.",
        "Gold, silver, copper—I want them all.",
        "I sleep better near my stash.",
        "You seem trustworthy… maybe.",
        "Just one more coin. Please?"
    ]
};

export function randomPersonality() {
    const keys = Object.keys(personalityDialogues);
    return keys[Math.floor(Math.random() * keys.length)];
}

export function dialoguesFor(personality) {
    return (personalityDialogues[personality] || []).slice();
}